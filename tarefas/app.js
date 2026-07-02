let refreshTimer;
let debounceTimer;
let sortMode = 'original';
let compactMode = false;
let focusMode = false;
let columnTimeVisible = true;
let selectMode = false;
let selectedTitles = new Set();
let isLoading = false;

const FILTER_DEBOUNCE_MS = 200;
const ACTIVITY_LOG_LIMIT = 20;
const SORT_MODES = ['original', 'prioridade', 'data', 'titulo'];
const STORAGE_KEYS = ['lastSheet', 'recentSheets', 'theme', 'dyslexicFont', 'sortMode', 'compactMode', 'collapseState', 'focusMode', 'columnTimeVisible', 'columnEntryTimes', 'activityLog', 'activityTotalCount', 'activityLastSeenCount', 'mode'];

function safeJsonParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

async function fetchListNames(id) {
  try {
    const url = buildSheetUrl(id, LISTS_SHEET_NAME, LISTS_RANGE);
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    if ((res.headers.get('content-type') || '').includes('text/html')) return [];
    const rows = parseCsv(await res.text());
    if (!rows.length || rows[0][0].trim().toLowerCase() !== LISTS_HEADER) return [];
    return filterRows(rows.slice(1)).map(r => r[0].trim());
  } catch { return []; }
}

async function fetchExtraList(id, sheetName) {
  try {
    const url = buildSheetUrl(id, sheetName, EXTRA_LIST_RANGE);
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    if ((res.headers.get('content-type') || '').includes('text/html')) return [];
    const rows = parseCsv(await res.text());
    if (!rows.length || rows[0][0].trim().toLowerCase() !== EXTRA_LIST_HEADER) return [];
    return filterRows(rows.slice(1));
  } catch { return []; }
}

function trackColumnTime(orderedResults) {
  const now = Date.now();
  const stored = safeJsonParse(localStorage.getItem('columnEntryTimes'), {});
  const updated = {};
  const daysByTitle = new Map();
  const newTitles = new Set();
  const transitions = [];

  orderedResults.forEach((rows, i) => {
    const column = SHEET_NAMES[i];
    rows.forEach(row => {
      const title = row[0].trim();
      const entry = stored[title];
      if (!entry) {
        newTitles.add(title);
      } else if (entry.column !== column) {
        transitions.push({ title, from: entry.column, to: column });
      }
      const since = entry && entry.column === column ? entry.since : now;
      updated[title] = { column, since };
      daysByTitle.set(title, Math.floor((now - since) / MS_PER_DAY));
    });
  });

  localStorage.setItem('columnEntryTimes', JSON.stringify(updated));
  return { daysByTitle, newTitles, transitions };
}

function logActivity(transitions) {
  const stored = safeJsonParse(localStorage.getItem('activityLog'), []);
  const log = [...transitions, ...stored].slice(0, ACTIVITY_LOG_LIMIT);
  localStorage.setItem('activityLog', JSON.stringify(log));
  const totalCount = (Number(localStorage.getItem('activityTotalCount')) || 0) + transitions.length;
  localStorage.setItem('activityTotalCount', totalCount);
  return { log, totalCount };
}

async function handleSubmit() {
  if (isLoading) return;
  clearInterval(refreshTimer);
  selectMode = false;
  selectedTitles.clear();

  const input = document.getElementById('sheet-url').value.trim();
  const id = extractSheetId(input);

  if (!id) {
    showState('error', 'URL inválida. Cole o link de compartilhamento do Google Sheets.');
    return;
  }

  isLoading = true;
  const editLink = document.getElementById('edit-link');
  showState('loading');
  editLink.classList.add('hidden');

  try {
    const fetches = SHEET_NAMES.map(async (name) => {
      const url = buildSheetUrl(id, name);
      const res = await fetchWithTimeout(url);
      if (!res.ok) return [];
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('A planilha retornou HTML. Verifique se ela está compartilhada como "Qualquer pessoa com o link pode ver".');
      }
      const text = await res.text();
      return filterRows(parseCsv(text));
    });

    const allResults = await Promise.all([...fetches, fetchListNames(id)]);
    const results = allResults.slice(0, SHEET_NAMES.length);
    const listNames = allResults[SHEET_NAMES.length];

    const extraLists = await Promise.all(
      listNames.map(async name => ({ name, rows: await fetchExtraList(id, name) }))
    );

    const orderedResults = results.map(rows => {
      if (sortMode === 'prioridade') return sortByPriority(rows);
      if (sortMode === 'data') return sortByDate(rows);
      if (sortMode === 'titulo') return sortByTitle(rows);
      return rows;
    });
    const { daysByTitle, newTitles, transitions } = trackColumnTime(orderedResults);
    orderedResults.forEach((rows, i) => renderColumn(COLUMN_BODIES[i], rows, daysByTitle, newTitles));
    if (!columnTimeVisible) document.querySelectorAll('.card-column-time').forEach(el => el.classList.add('hidden'));
    const { log: activityLog, totalCount: activityTotalCount } = logActivity(transitions);
    renderActivityFeed(activityLog);
    const activityLastSeen = Number(localStorage.getItem('activityLastSeenCount')) || 0;
    updateActivityBadge(Math.max(activityTotalCount - activityLastSeen, 0));
    renderSummary(results.map(r => r.length), countOverdue(), countWarning());
    renderExtraLists(extraLists);
    populateModeSelect(extraLists.map(({ name, rows }) => ({ name, count: rows.length })));
    const responsavelCounts = results.flat().reduce((counts, r) => {
      const name = r[4] && r[4].trim();
      if (name) counts[name] = (counts[name] || 0) + 1;
      return counts;
    }, {});
    const responsaveis = Object.entries(responsavelCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    populateResponsavelFilter(responsaveis);
    const hasTags = results.flat().some(r => r[6] && r[6].trim());
    document.getElementById('filter-input').placeholder = responsaveis.length > 0 || hasTags
      ? 'Filtrar por título, responsável ou tag...'
      : 'Filtrar tarefas...';

    showState('success');
    const storedMode = localStorage.getItem('mode') || 'tarefas';
    setMode(['tarefas', ...listNames].includes(storedMode) ? storedMode : 'tarefas');

    editLink.href = input;
    editLink.classList.remove('hidden');
    document.querySelector('.app-header').dataset.printDate = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    localStorage.setItem('lastSheet', input);
    saveRecentSheet(input);
    history.replaceState(null, '', `?sheet=${encodeURIComponent(input)}`);

    const autoActive = document.getElementById('auto-refresh').checked;
    document.getElementById('refresh-btn').classList.toggle('header-action-btn--active', autoActive);
    if (autoActive) {
      const intervalMs = parseInt(document.getElementById('refresh-interval').value, 10) * 60000;
      refreshTimer = setInterval(handleSubmit, intervalMs);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      showState('error', 'A planilha demorou demais para responder. Verifique sua conexão e tente novamente.');
    } else {
      showState('error', err.message || 'Erro ao carregar a planilha. Verifique a URL e a visibilidade da planilha.');
    }
  } finally {
    isLoading = false;
  }
}

function updateUrlParam(key, value) {
  const params = new URLSearchParams(location.search);
  if (value) params.set(key, value); else params.delete(key);
  const qs = params.toString();
  return `${location.pathname}${qs ? '?' + qs : ''}`;
}

function copySheetUrl() {
  const url = document.getElementById('edit-link').href;
  const btn = document.getElementById('copy-sheet-btn');
  navigator.clipboard.writeText(url).then(() => flashButton(btn, '✓ Copiado!'));
}

function copyBoardLink() {
  const input = document.getElementById('sheet-url').value.trim();
  if (!input) return;
  const url = `${location.origin}${location.pathname}?sheet=${encodeURIComponent(input)}`;
  const btn = document.getElementById('copy-link-btn');
  navigator.clipboard.writeText(url).then(() => flashButton(btn, '✓ Copiado!'));
}

function exportBoardText() {
  const btn = document.getElementById('export-btn');
  navigator.clipboard.writeText(buildBoardText()).then(() => flashButton(btn, '✓ Exportado!'));
}

function downloadBoardText() {
  const blob = new Blob([buildBoardText()], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sprint-board.md';
  a.click();
  URL.revokeObjectURL(a.href);
}

function csvEscape(str) {
  const s = str || '';
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCardRowCsv(card, colName) {
  return [colName, card.dataset.title, card.dataset.desc, card.dataset.date, card.dataset.priority, card.dataset.responsavel, card.dataset.link, card.dataset.tags].map(csvEscape).join(',');
}

function buildBoardCsv() {
  const rows = ['Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags'];
  document.querySelectorAll('.column').forEach(col => {
    const colName = col.querySelector('.column-header').textContent.replace(/ \(\d+\)$/, '');
    col.querySelectorAll('.card:not(.hidden)').forEach(card => {
      rows.push(buildCardRowCsv(card, colName));
    });
  });
  return rows.join('\n');
}

function downloadBoardCsv() {
  const blob = new Blob(['﻿' + buildBoardCsv()], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sprint-board.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildTemplateCsv(headers) {
  return headers.map(csvEscape).join(',');
}

function downloadTemplateCsv() {
  const type = document.getElementById('template-select').value;
  const { headers, filename } = TEMPLATE_CONFIG[type];
  const blob = new Blob(['﻿' + buildTemplateCsv(headers)], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildBoardJson() {
  const board = {};
  document.querySelectorAll('.column').forEach(col => {
    const header = col.querySelector('.column-header').textContent.replace(/ \(\d+\)$/, '');
    board[header] = Array.from(col.querySelectorAll('.card:not(.hidden)')).map(card => ({
      title: card.dataset.title || '',
      desc: card.dataset.desc || '',
      date: card.dataset.date || '',
      priority: card.dataset.priority || '',
      responsavel: card.dataset.responsavel || '',
      link: card.dataset.link || '',
      tags: card.dataset.tags || ''
    }));
  });
  return board;
}

function downloadBoardJson() {
  const blob = new Blob([JSON.stringify(buildBoardJson(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sprint-board.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadIcs(title, desc, dateStr) {
  const blob = new Blob([buildIcsContent(title, desc, dateStr)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tarefa.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadIcsCalendar() {
  const events = Array.from(document.querySelectorAll('.card:not(.hidden)'))
    .filter(card => card.dataset.date)
    .map(card => ({ title: card.dataset.title, desc: card.dataset.desc, date: card.dataset.date }));
  const blob = new Blob([buildIcsCalendar(events)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sprint-board.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetAllSettings() {
  if (!confirm('Limpar todas as configurações e recarregar a página?')) return;
  STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
  location.reload();
}

function saveCollapseState() {
  const state = {};
  document.querySelectorAll('.column').forEach(col => {
    state[col.id] = col.classList.contains('column--collapsed');
  });
  localStorage.setItem('collapseState', JSON.stringify(state));
}

function initCollapseState() {
  const state = safeJsonParse(localStorage.getItem('collapseState'), null);
  if (!state) return;
  document.querySelectorAll('.column').forEach(col => {
    col.classList.toggle('column--collapsed', !!state[col.id]);
  });
}

function saveRecentSheet(url) {
  const list = safeJsonParse(localStorage.getItem('recentSheets'), []);
  const updated = [url, ...list.filter(u => u !== url)].slice(0, 5);
  localStorage.setItem('recentSheets', JSON.stringify(updated));
}

function initRecentSheets() {
  const list = safeJsonParse(localStorage.getItem('recentSheets'), []);
  if (!list.length) return;
  const select = document.getElementById('sheet-select');
  const group = document.createElement('optgroup');
  group.label = 'Recentes';
  list.forEach(url => {
    const opt = document.createElement('option');
    opt.value = url;
    opt.textContent = url.length > 50 ? url.slice(0, 50) + '…' : url;
    group.appendChild(opt);
  });
  select.appendChild(group);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  const toggle = document.getElementById('theme-toggle');

  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    toggle.textContent = '☾';
  } else {
    toggle.textContent = '☀';
  }

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    if (isDark) {
      delete document.documentElement.dataset.theme;
      localStorage.setItem('theme', 'light');
      toggle.textContent = '☀';
    } else {
      document.documentElement.dataset.theme = 'dark';
      localStorage.setItem('theme', 'dark');
      toggle.textContent = '☾';
    }
  });
}

function initDyslexicFont() {
  const enabled = localStorage.getItem('dyslexicFont') === 'true';
  const toggle = document.getElementById('dyslexic-toggle');

  if (enabled) {
    document.documentElement.dataset.dyslexicFont = 'true';
    toggle.classList.add('header-action-btn--active');
  }

  toggle.addEventListener('click', () => {
    const isEnabled = document.documentElement.dataset.dyslexicFont === 'true';
    if (isEnabled) {
      delete document.documentElement.dataset.dyslexicFont;
      localStorage.setItem('dyslexicFont', 'false');
      toggle.classList.remove('header-action-btn--active');
    } else {
      document.documentElement.dataset.dyslexicFont = 'true';
      localStorage.setItem('dyslexicFont', 'true');
      toggle.classList.add('header-action-btn--active');
    }
  });
}

function setupDropdownMenu(btnId, panelId) {
  const panel = document.getElementById(panelId);
  document.getElementById(btnId).addEventListener('click', () => {
    panel.classList.toggle('hidden');
  });
  panel.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') panel.classList.add('hidden');
  });
}

function updateViewMenuLabel() {
  const active = [compactMode, focusMode, columnTimeVisible, document.getElementById('auto-refresh').checked]
    .filter(Boolean).length;
  document.getElementById('view-menu-btn').textContent = `Visualização${active > 0 ? ` (${active})` : ''} ▾`;
}

document.getElementById('board').addEventListener('click', e => {
  const emptyCta = e.target.closest('.empty-column-cta');
  if (emptyCta) { openNewTaskModal(); return; }
  const moreBtn = e.target.closest('.card-more-btn');
  if (moreBtn) {
    moreBtn.closest('.card').querySelector('.card-more-panel').classList.toggle('hidden');
    return;
  }
  const cardTitle = e.target.closest('.card-title');
  if (cardTitle) { openCardDetail(cardTitle.closest('.card')); return; }
  const askBtn = e.target.closest('.card-ask-claude-btn');
  if (askBtn) {
    const card = askBtn.closest('.card');
    const { title, desc, date } = card.dataset;
    const q = `Estou trabalhando na tarefa: ${title}.${desc ? ' ' + desc : ''} ${date ? 'Prazo: ' + date + '.' : ''} Como você me ajudaria com essa tarefa?`;
    navigator.clipboard.writeText(q).then(() => {
      flashButton(askBtn, '✓ Copiado!');
      window.open('https://claude.ai');
    });
    return;
  }
  const calBtn = e.target.closest('.card-calendar-btn');
  if (calBtn) {
    const { title, desc, date } = calBtn.closest('.card').dataset;
    downloadIcs(title, desc, date);
    window.open(buildCalendarUrl(title, desc, date));
    flashButton(calBtn, '✓ Agenda!');
    return;
  }
  const copyBtn = e.target.closest('.card-copy-btn');
  if (copyBtn) {
    const { title, desc, date, priority } = copyBtn.closest('.card').dataset;
    navigator.clipboard.writeText(buildCardSummaryText(title, desc, date, priority)).then(() => flashButton(copyBtn, '✓ Copiado!'));
    return;
  }
  const whatsappBtn = e.target.closest('.card-whatsapp-btn');
  if (whatsappBtn) {
    const { title, desc, date, priority } = whatsappBtn.closest('.card').dataset;
    window.open(buildWhatsAppUrl(title, desc, date, priority));
    return;
  }
  const dupBtn = e.target.closest('.card-duplicate-btn');
  if (dupBtn) {
    const { title, desc, date, priority } = dupBtn.closest('.card').dataset;
    openNewTaskModal({ name: `${title} (cópia)`, desc: desc || '', date: toIsoDate(date), priority: priority || '' });
    return;
  }
  const priorityBadge = e.target.closest('.card-priority');
  if (priorityBadge) {
    const filterInput = document.getElementById('filter-input');
    const filterCount = document.getElementById('filter-count');
    const priorityText = priorityBadge.textContent;
    const newQuery = filterInput.value === priorityText ? '' : priorityText;
    filterInput.value = newQuery;
    const visible = filterCards(newQuery, document.getElementById('responsavel-filter').value);
    document.getElementById('filter-clear-btn').classList.toggle('hidden', newQuery === '');
    const total = document.querySelectorAll('.card').length;
    filterCount.textContent = `${visible} de ${total}`;
    filterCount.classList.toggle('hidden', newQuery === '');
    return;
  }
  const tagBadge = e.target.closest('.card-tag');
  if (tagBadge) {
    const filterInput = document.getElementById('filter-input');
    const filterCount = document.getElementById('filter-count');
    const tagText = tagBadge.textContent;
    const newQuery = filterInput.value === tagText ? '' : tagText;
    filterInput.value = newQuery;
    const visible = filterCards(newQuery, document.getElementById('responsavel-filter').value);
    document.getElementById('filter-clear-btn').classList.toggle('hidden', newQuery === '');
    const total = document.querySelectorAll('.card').length;
    filterCount.textContent = `${visible} de ${total}`;
    filterCount.classList.toggle('hidden', newQuery === '');
  }
});
document.getElementById('board').addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
    e.preventDefault();
    openCardDetail(e.target);
  }
});
document.getElementById('board').addEventListener('change', e => {
  const checkbox = e.target.closest('.card-select-checkbox');
  if (!checkbox) return;
  const title = checkbox.closest('.card').dataset.title;
  if (checkbox.checked) selectedTitles.add(title); else selectedTitles.delete(title);
  updateSelectedCount(selectedTitles.size);
});
document.getElementById('select-mode-btn').addEventListener('click', () => {
  selectMode = !selectMode;
  document.getElementById('board').classList.toggle('board--selecting', selectMode);
  document.getElementById('bulk-actions-bar').classList.toggle('hidden', !selectMode);
  document.getElementById('select-mode-btn').classList.toggle('header-action-btn--active', selectMode);
  if (!selectMode) {
    selectedTitles.clear();
    document.querySelectorAll('.card-select-checkbox').forEach(cb => { cb.checked = false; });
  }
  updateSelectedCount(selectedTitles.size);
});
document.getElementById('cancel-select-btn').addEventListener('click', () => {
  document.getElementById('select-mode-btn').click();
});
document.getElementById('select-all-btn').addEventListener('click', () => {
  document.querySelectorAll('.card:not(.hidden) .card-select-checkbox').forEach(checkbox => {
    checkbox.checked = true;
    selectedTitles.add(checkbox.closest('.card').dataset.title);
  });
  updateSelectedCount(selectedTitles.size);
});
document.getElementById('copy-selected-btn').addEventListener('click', () => {
  const selectedCards = Array.from(document.querySelectorAll('.card')).filter(c => selectedTitles.has(c.dataset.title));
  const text = selectedCards.map(c => buildCardSummaryText(c.dataset.title, c.dataset.desc, c.dataset.date, c.dataset.priority)).join('\n');
  navigator.clipboard.writeText(text).then(() => flashButton(document.getElementById('copy-selected-btn'), '✓ Copiado!'));
});
document.getElementById('csv-selected-btn').addEventListener('click', () => {
  const rows = ['Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags'];
  document.querySelectorAll('.column').forEach(col => {
    const colName = col.querySelector('.column-header').textContent.replace(/ \(\d+\)$/, '');
    col.querySelectorAll('.card').forEach(card => {
      if (selectedTitles.has(card.dataset.title)) rows.push(buildCardRowCsv(card, colName));
    });
  });
  const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sprint-board-selecionados.csv';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('sort-select').addEventListener('change', e => {
  sortMode = e.target.value;
  localStorage.setItem('sortMode', sortMode);
  handleSubmit();
});
document.getElementById('compact-btn').addEventListener('click', () => {
  compactMode = !compactMode;
  document.getElementById('board').classList.toggle('board--compact', compactMode);
  document.getElementById('compact-btn').classList.toggle('header-action-btn--active', compactMode);
  localStorage.setItem('compactMode', compactMode);
  updateViewMenuLabel();
});
document.getElementById('focus-btn').addEventListener('click', () => {
  focusMode = !focusMode;
  document.getElementById('col-done').classList.toggle('hidden', focusMode);
  document.getElementById('focus-btn').classList.toggle('header-action-btn--active', focusMode);
  localStorage.setItem('focusMode', focusMode);
  updateViewMenuLabel();
});
document.getElementById('column-time-toggle-btn').addEventListener('click', () => {
  columnTimeVisible = !columnTimeVisible;
  document.querySelectorAll('.card-column-time').forEach(el => el.classList.toggle('hidden', !columnTimeVisible));
  document.getElementById('column-time-toggle-btn').classList.toggle('header-action-btn--active', columnTimeVisible);
  localStorage.setItem('columnTimeVisible', columnTimeVisible);
  updateViewMenuLabel();
});
document.getElementById('auto-refresh').addEventListener('change', updateViewMenuLabel);

document.getElementById('reset-btn').addEventListener('click', () => {
  showState('idle');
  document.getElementById('sheet-url').value = '';
  history.replaceState(null, '', location.pathname);
});

document.getElementById('sheet-select').addEventListener('change', e => {
  if (e.target.value) document.getElementById('sheet-url').value = e.target.value;
});
document.getElementById('load-btn').addEventListener('click', handleSubmit);
document.getElementById('sheet-url').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSubmit();
});
document.getElementById('refresh-btn').addEventListener('click', handleSubmit);
document.getElementById('activity-btn').addEventListener('click', () => {
  const panel = document.getElementById('activity-panel');
  const opening = panel.classList.contains('hidden');
  panel.classList.toggle('hidden');
  if (opening) {
    localStorage.setItem('activityLastSeenCount', localStorage.getItem('activityTotalCount') || 0);
    updateActivityBadge(0);
  }
});
document.getElementById('copy-link-btn').addEventListener('click', copyBoardLink);
document.getElementById('copy-sheet-btn').addEventListener('click', copySheetUrl);
document.getElementById('export-btn').addEventListener('click', exportBoardText);
document.getElementById('download-btn').addEventListener('click', downloadBoardText);
document.getElementById('json-btn').addEventListener('click', downloadBoardJson);
document.getElementById('csv-btn').addEventListener('click', downloadBoardCsv);
document.getElementById('ics-btn').addEventListener('click', downloadIcsCalendar);
document.getElementById('template-btn').addEventListener('click', downloadTemplateCsv);
setupDropdownMenu('export-menu-btn', 'export-menu-panel');
setupDropdownMenu('share-menu-btn', 'share-menu-panel');
setupDropdownMenu('view-menu-btn', 'view-menu-panel');
document.addEventListener('click', e => {
  document.querySelectorAll('.export-menu-panel').forEach(panel => {
    if (!panel.classList.contains('hidden') && !e.target.closest('.export-menu')) {
      panel.classList.add('hidden');
    }
  });
  document.querySelectorAll('.card-more-panel').forEach(panel => {
    if (!panel.classList.contains('hidden') && !e.target.closest('.card-actions')) {
      panel.classList.add('hidden');
    }
  });
});
document.getElementById('mode-select').addEventListener('change', e => {
  setMode(e.target.value);
  localStorage.setItem('mode', e.target.value);
});
document.querySelectorAll('.column-header').forEach(h => {
  h.addEventListener('click', e => {
    if (e.shiftKey && e.ctrlKey) {
      const body = h.closest('.column').querySelector('.column-body');
      const colName = h.textContent.replace(/ \(\d+\)$/, '');
      const cards = Array.from(body.querySelectorAll('.card:not(.hidden)'));
      const rows = ['Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags', ...cards.map(c => buildCardRowCsv(c, colName))];
      navigator.clipboard.writeText(rows.join('\n')).then(() => flashButton(h, '✓ CSV!'));
      return;
    }
    if (e.shiftKey) {
      const body = h.closest('.column').querySelector('.column-body');
      const colName = h.textContent.replace(/ \(\d+\)$/, '');
      const cards = Array.from(body.querySelectorAll('.card:not(.hidden)'));
      const lines = [`## ${colName}`, ...cards.map(c => `- ${c.dataset.title}${c.dataset.desc ? ' — ' + c.dataset.desc : ''}`)];
      navigator.clipboard.writeText(lines.join('\n')).then(() => flashButton(h, '✓ Copiado!'));
      return;
    }
    toggleColumnCollapse(h.closest('.column'));
    saveCollapseState();
  });
});
document.getElementById('filter-input').addEventListener('input', e => {
  const query = e.target.value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const visible = filterCards(query, document.getElementById('responsavel-filter').value);
    document.getElementById('filter-clear-btn').classList.toggle('hidden', query === '');
    const filterCount = document.getElementById('filter-count');
    filterCount.textContent = `${visible} de ${document.querySelectorAll('.card').length}`;
    filterCount.classList.toggle('hidden', query === '');
    history.replaceState(null, '', updateUrlParam('filter', query || null));
  }, FILTER_DEBOUNCE_MS);
});
document.getElementById('filter-clear-btn').addEventListener('click', () => {
  const filterInput = document.getElementById('filter-input');
  filterInput.value = '';
  filterCards('', document.getElementById('responsavel-filter').value);
  document.getElementById('filter-clear-btn').classList.add('hidden');
  document.getElementById('filter-count').classList.add('hidden');
  history.replaceState(null, '', updateUrlParam('filter', null));
  filterInput.focus();
});
document.getElementById('responsavel-filter').addEventListener('change', e => {
  const filterInput = document.getElementById('filter-input');
  const visible = filterCards(filterInput.value, e.target.value);
  const filterCount = document.getElementById('filter-count');
  const showCount = filterInput.value !== '' || e.target.value !== '';
  filterCount.textContent = `${visible} de ${document.querySelectorAll('.card').length}`;
  filterCount.classList.toggle('hidden', !showCount);
});
document.getElementById('card-detail-close').addEventListener('click', closeCardDetail);
document.getElementById('card-detail-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCardDetail();
});
document.getElementById('help-btn').addEventListener('click', toggleHelp);
document.getElementById('help-close-btn').addEventListener('click', toggleHelp);
document.getElementById('help-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) toggleHelp();
});
document.getElementById('task-name').addEventListener('input', function () {
  this.classList.remove('input--invalid');
  document.getElementById('task-name-count').textContent = `${this.value.length} / 80`;
});
document.getElementById('task-desc').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
  document.getElementById('task-desc-count').textContent = `${this.value.length} / ${TASK_DESC_MAX}`;
});
document.getElementById('task-desc').addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitNewTask();
});
window.addEventListener('scroll', () => {
  document.getElementById('back-to-top').classList.toggle('hidden', window.scrollY <= 300);
});
document.getElementById('back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('reset-settings-btn').addEventListener('click', resetAllSettings);
document.getElementById('new-task-btn').addEventListener('click', openNewTaskModal);
document.getElementById('modal-cancel').addEventListener('click', closeNewTaskModal);
document.getElementById('modal-submit').addEventListener('click', submitNewTask);
document.getElementById('new-task-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeNewTaskModal();
});
document.getElementById('task-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitNewTask();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const filterInput = document.getElementById('filter-input');
    if (document.activeElement === filterInput && filterInput.value) {
      filterInput.value = '';
      filterCards('', document.getElementById('responsavel-filter').value);
      document.getElementById('filter-clear-btn').classList.add('hidden');
      document.getElementById('filter-count').classList.add('hidden');
      history.replaceState(null, '', updateUrlParam('filter', null));
      return;
    }
    closeNewTaskModal();
    closeCardDetail();
    document.getElementById('help-overlay').classList.add('hidden');
    return;
  }
  if (e.key === '?') { toggleHelp(); return; }
  const boardVisible = !document.getElementById('board').classList.contains('hidden');
  const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
  if (boardVisible && !inInput && e.key === 'Escape') {
    const fi = document.getElementById('filter-input');
    if (fi.value) {
      fi.value = '';
      filterCards('', document.getElementById('responsavel-filter').value);
      document.getElementById('filter-clear-btn').classList.add('hidden');
      document.getElementById('filter-count').classList.add('hidden');
      history.replaceState(null, '', updateUrlParam('filter', null));
      return;
    }
  }
  if (!boardVisible || inInput) return;
  if (e.key === 'r' || e.key === 'R') handleSubmit();
  if (e.key === 'f' || e.key === 'F') document.getElementById('filter-input').focus();
  if (e.key === 'n' || e.key === 'N') openNewTaskModal();
  if (e.key === 'd' || e.key === 'D') document.getElementById('compact-btn').click();
  if (e.key === 't' || e.key === 'T') document.getElementById('theme-toggle').click();
  if (e.key === 'g' || e.key === 'G') {
    const el = document.getElementById('edit-link');
    if (!el.classList.contains('hidden')) el.click();
  }
  if (e.key === 'p' || e.key === 'P') window.print();
  if (e.key === 's' || e.key === 'S') {
    const select = document.getElementById('sort-select');
    select.value = SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length];
    select.dispatchEvent(new Event('change'));
  }
  if (e.key === 'e' || e.key === 'E') exportBoardText();
  if (e.key === 'c' || e.key === 'C') {
    const cols = document.querySelectorAll('.column');
    const allCollapsed = Array.from(cols).every(c => c.classList.contains('column--collapsed'));
    cols.forEach(c => c.classList.toggle('column--collapsed', !allCollapsed));
    saveCollapseState();
  }
  if (e.key === 'v' || e.key === 'V') document.getElementById('select-mode-btn').click();
});

document.querySelectorAll('.version-text').forEach(el => { el.textContent = APP_VERSION; });

populateSelect();
populateTemplateSelect();
initRecentSheets();
initTheme();
initDyslexicFont();
initCollapseState();

const storedSortMode = localStorage.getItem('sortMode');
if (storedSortMode) {
  sortMode = storedSortMode;
  document.getElementById('sort-select').value = sortMode;
}
if (localStorage.getItem('compactMode') === 'true') {
  compactMode = true;
  document.getElementById('board').classList.add('board--compact');
  document.getElementById('compact-btn').classList.add('header-action-btn--active');
}
if (localStorage.getItem('focusMode') === 'true') {
  focusMode = true;
  document.getElementById('col-done').classList.add('hidden');
  document.getElementById('focus-btn').classList.add('header-action-btn--active');
}
if (localStorage.getItem('columnTimeVisible') === 'false') {
  columnTimeVisible = false;
  document.getElementById('column-time-toggle-btn').classList.remove('header-action-btn--active');
}
updateViewMenuLabel();

const urlParams = new URLSearchParams(location.search);
const urlSheet = urlParams.get('sheet');
const urlFilter = urlParams.get('filter');
const urlReadonly = urlParams.get('readonly') === '1';
if (urlReadonly) {
  document.documentElement.classList.add('board--readonly');
  document.getElementById('readonly-badge').classList.remove('hidden');
}
const autoLoadUrl = urlSheet || localStorage.getItem('lastSheet');
if (autoLoadUrl) {
  document.getElementById('sheet-url').value = autoLoadUrl;
  handleSubmit().then(() => {
    if (urlFilter) {
      const fi = document.getElementById('filter-input');
      fi.value = urlFilter;
      const visible = filterCards(urlFilter);
      document.getElementById('filter-clear-btn').classList.remove('hidden');
      const fc = document.getElementById('filter-count');
      fc.textContent = `${visible} de ${document.querySelectorAll('.card').length}`;
      fc.classList.remove('hidden');
    }
  });
}
