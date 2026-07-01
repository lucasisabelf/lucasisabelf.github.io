let refreshTimer;
let sortMode = 'original';
let compactMode = false;
let focusMode = false;

const SORT_MODES = ['original', 'prioridade', 'data', 'titulo'];
const STORAGE_KEYS = ['lastSheet', 'recentSheets', 'theme', 'sortMode', 'compactMode', 'collapseState', 'focusMode', 'mode'];

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

async function handleSubmit() {
  clearInterval(refreshTimer);

  const input = document.getElementById('sheet-url').value.trim();
  const id = extractSheetId(input);

  if (!id) {
    showState('error', 'URL inválida. Cole o link de compartilhamento do Google Sheets.');
    return;
  }

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
    orderedResults.forEach((rows, i) => renderColumn(COLUMN_BODIES[i], rows));
    renderSummary(results.map(r => r.length), countOverdue(), countWarning());
    renderExtraLists(extraLists);
    populateModeSelect(listNames);
    const responsaveis = [...new Set(results.flat().map(r => r[4] && r[4].trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    populateResponsavelFilter(responsaveis);

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
    showState('error', err.message || 'Erro ao carregar a planilha. Verifique a URL e a visibilidade da planilha.');
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

function buildBoardCsv() {
  const rows = ['Coluna,Título,Descrição,Data,Prioridade,Responsável,Link'];
  document.querySelectorAll('.column').forEach(col => {
    const colName = col.querySelector('.column-header').textContent.replace(/ \(\d+\)$/, '');
    col.querySelectorAll('.card').forEach(card => {
      rows.push([colName, card.dataset.title, card.dataset.desc, card.dataset.date, card.dataset.priority, card.dataset.responsavel, card.dataset.link].map(csvEscape).join(','));
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
    board[header] = Array.from(col.querySelectorAll('.card')).map(card => ({
      title: card.dataset.title || '',
      desc: card.dataset.desc || '',
      date: card.dataset.date || '',
      priority: card.dataset.priority || '',
      responsavel: card.dataset.responsavel || '',
      link: card.dataset.link || ''
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
  const stored = localStorage.getItem('collapseState');
  if (!stored) return;
  const state = JSON.parse(stored);
  document.querySelectorAll('.column').forEach(col => {
    col.classList.toggle('column--collapsed', !!state[col.id]);
  });
}

function saveRecentSheet(url) {
  const stored = localStorage.getItem('recentSheets');
  const list = stored ? JSON.parse(stored) : [];
  const updated = [url, ...list.filter(u => u !== url)].slice(0, 5);
  localStorage.setItem('recentSheets', JSON.stringify(updated));
}

function initRecentSheets() {
  const stored = localStorage.getItem('recentSheets');
  if (!stored) return;
  const list = JSON.parse(stored);
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

document.getElementById('board').addEventListener('click', e => {
  const emptyCta = e.target.closest('.empty-column-cta');
  if (emptyCta) { openNewTaskModal(); return; }
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
    const text = `${title}${desc ? ' — ' + desc : ''}${date ? ' · ' + date : ''}${priority ? ' [' + priority + ']' : ''}`;
    navigator.clipboard.writeText(text).then(() => flashButton(copyBtn, '✓ Copiado!'));
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
  }
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
});
document.getElementById('focus-btn').addEventListener('click', () => {
  focusMode = !focusMode;
  document.getElementById('col-done').classList.toggle('hidden', focusMode);
  document.getElementById('focus-btn').classList.toggle('header-action-btn--active', focusMode);
  localStorage.setItem('focusMode', focusMode);
});

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
document.getElementById('copy-link-btn').addEventListener('click', copyBoardLink);
document.getElementById('copy-sheet-btn').addEventListener('click', copySheetUrl);
document.getElementById('export-btn').addEventListener('click', exportBoardText);
document.getElementById('download-btn').addEventListener('click', downloadBoardText);
document.getElementById('json-btn').addEventListener('click', downloadBoardJson);
document.getElementById('csv-btn').addEventListener('click', downloadBoardCsv);
document.getElementById('template-btn').addEventListener('click', downloadTemplateCsv);
document.getElementById('export-menu-btn').addEventListener('click', () => {
  document.getElementById('export-menu-panel').classList.toggle('hidden');
});
document.getElementById('export-menu-panel').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') document.getElementById('export-menu-panel').classList.add('hidden');
});
document.getElementById('share-menu-btn').addEventListener('click', () => {
  document.getElementById('share-menu-panel').classList.toggle('hidden');
});
document.getElementById('share-menu-panel').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') document.getElementById('share-menu-panel').classList.add('hidden');
});
document.addEventListener('click', e => {
  document.querySelectorAll('.export-menu-panel').forEach(panel => {
    if (!panel.classList.contains('hidden') && !e.target.closest('.export-menu')) {
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
      const cards = Array.from(body.querySelectorAll('.card'));
      const rows = ['Coluna,Título,Descrição,Data,Prioridade,Responsável,Link', ...cards.map(c => [colName, c.dataset.title, c.dataset.desc, c.dataset.date, c.dataset.priority, c.dataset.responsavel, c.dataset.link].map(csvEscape).join(','))];
      navigator.clipboard.writeText(rows.join('\n')).then(() => flashButton(h, '✓ CSV!'));
      return;
    }
    if (e.shiftKey) {
      const body = h.closest('.column').querySelector('.column-body');
      const colName = h.textContent.replace(/ \(\d+\)$/, '');
      const cards = Array.from(body.querySelectorAll('.card'));
      const lines = [`## ${colName}`, ...cards.map(c => `- ${c.dataset.title}${c.dataset.desc ? ' — ' + c.dataset.desc : ''}`)];
      navigator.clipboard.writeText(lines.join('\n')).then(() => flashButton(h, '✓ Copiado!'));
      return;
    }
    toggleColumnCollapse(h.closest('.column'));
    saveCollapseState();
  });
});
document.getElementById('filter-input').addEventListener('input', e => {
  const visible = filterCards(e.target.value, document.getElementById('responsavel-filter').value);
  document.getElementById('filter-clear-btn').classList.toggle('hidden', e.target.value === '');
  const filterCount = document.getElementById('filter-count');
  filterCount.textContent = `${visible} de ${document.querySelectorAll('.card').length}`;
  filterCount.classList.toggle('hidden', e.target.value === '');
  history.replaceState(null, '', updateUrlParam('filter', e.target.value || null));
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
});

document.querySelectorAll('.version-text').forEach(el => { el.textContent = APP_VERSION; });

populateSelect();
populateTemplateSelect();
initRecentSheets();
initTheme();
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

const urlSheet = new URLSearchParams(location.search).get('sheet');
const urlFilter = new URLSearchParams(location.search).get('filter');
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
