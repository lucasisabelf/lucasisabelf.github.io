const PRIORITY_CLASS = { 'Alta': 'priority--high', 'Média': 'priority--mid', 'Baixa': 'priority--low' };
const PRIORITY_ORDER = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };
const DAYS_UNTIL_WARNING = 3;
const TASK_DESC_MAX = 300;
const MS_PER_DAY = 86400000;

function flashButton(btn, tempText) {
  const original = btn.textContent;
  btn.textContent = tempText;
  setTimeout(() => { btn.textContent = original; }, 2000);
}

function parsePtBrDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  return isNaN(d.getTime()) ? null : d;
}

function renderCard(row) {
  const name = row[0].trim();
  const desc = row[1] ? row[1].trim() : '';
  const date = row[2] ? row[2].trim() : '';
  const priority = row[3] ? row[3].trim() : '';

  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.title = name;
  card.dataset.desc = desc;
  card.dataset.date = date;
  card.dataset.priority = priority;

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = name;
  card.appendChild(title);

  if (desc) {
    const d = document.createElement('div');
    d.className = 'card-desc';
    d.textContent = desc;
    card.appendChild(d);
  }

  if (date) {
    const dt = document.createElement('span');
    dt.className = 'card-date';
    dt.textContent = date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsed = parsePtBrDate(date);
    if (parsed && parsed < today) {
      dt.classList.add('card-date--overdue');
    } else if (parsed && parsed.getTime() === today.getTime()) {
      dt.classList.add('card-date--today');
    } else {
      const warningThreshold = new Date();
      warningThreshold.setDate(warningThreshold.getDate() + DAYS_UNTIL_WARNING);
      if (parsed && parsed > today && parsed <= warningThreshold) {
        dt.classList.add('card-date--warning');
      }
    }
    if (parsed) {
      const delta = Math.round((parsed - today) / MS_PER_DAY);
      if (delta > 0) dt.textContent = `${date} · em ${delta} dia${delta !== 1 ? 's' : ''}`;
      else if (delta < 0) dt.textContent = `${date} · há ${Math.abs(delta)} dia${Math.abs(delta) !== 1 ? 's' : ''}`;
      dt.title = parsed.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    card.appendChild(dt);
  }

  if (priority && PRIORITY_CLASS[priority]) {
    const badge = document.createElement('span');
    badge.className = `card-priority ${PRIORITY_CLASS[priority]}`;
    badge.textContent = priority;
    card.appendChild(badge);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const askBtn = document.createElement('button');
  askBtn.className = 'card-action-btn card-ask-claude-btn';
  askBtn.textContent = 'Sugerir ao Claude';
  actions.appendChild(askBtn);

  const calBtn = document.createElement('button');
  calBtn.className = 'card-action-btn card-calendar-btn';
  calBtn.textContent = '+ Agenda';
  actions.appendChild(calBtn);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'card-action-btn card-copy-btn';
  copyBtn.textContent = 'Copiar';
  actions.appendChild(copyBtn);

  card.appendChild(actions);

  return card;
}

function renderColumn(bodyId, rows) {
  const body = document.getElementById(bodyId);
  body.innerHTML = '';

  const header = body.closest('.column').querySelector('.column-header');
  header.textContent = header.textContent.replace(/ \(\d+\)$/, '') + (rows.length > 0 ? ` (${rows.length})` : '');

  if (rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-column';
    empty.textContent = 'Nenhuma tarefa';
    body.appendChild(empty);
    return;
  }

  rows.forEach(row => body.appendChild(renderCard(row)));
  body.scrollTop = 0;
}

function renderSummary(counts, overdue, warning) {
  const total = counts.reduce((s, n) => s + n, 0);
  let text = `${total} total · ${counts[1]} em andamento · ${counts[2]} concluídas`;
  if (overdue > 0) text += ` · ${overdue} vencida${overdue !== 1 ? 's' : ''}`;
  if (warning > 0) text += ` · ${warning} com prazo próximo`;
  const alta = countByPriority('Alta');
  const media = countByPriority('Média');
  const baixa = countByPriority('Baixa');
  if (alta > 0 || media > 0 || baixa > 0) text += ` · Alta: ${alta} · Média: ${media} · Baixa: ${baixa}`;
  const hhmm = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  text += ` · Atualizado às ${hhmm}`;
  document.getElementById('board-summary').textContent = text;
  const pct = total > 0 ? Math.round((counts[2] / total) * 100) : 0;
  document.getElementById('sprint-progress-bar').style.width = pct + '%';
  document.title = alta > 0 ? `⚠ ${alta} · Sprint Board · ${pct}%` : pct > 0 ? `Sprint Board · ${pct}%` : 'Sprint Board';
}

function sortByPriority(rows) {
  return [...rows].sort((a, b) =>
    (PRIORITY_ORDER[a[3]] ?? 3) - (PRIORITY_ORDER[b[3]] ?? 3)
  );
}

function sortByTitle(rows) {
  return [...rows].sort((a, b) => (a[0] || '').localeCompare(b[0] || '', 'pt-BR'));
}

function sortByDate(rows) {
  return [...rows].sort((a, b) => {
    const da = parsePtBrDate(a[2]);
    const db = parsePtBrDate(b[2]);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });
}

function countOverdue() {
  return document.querySelectorAll('.card-date--overdue').length;
}

function countWarning() {
  return document.querySelectorAll('.card-date--warning').length;
}

function countByPriority(priority) {
  return document.querySelectorAll(`.card:not(.hidden)[data-priority="${priority}"]`).length;
}

function buildBoardText() {
  const lines = [];
  document.querySelectorAll('.column').forEach(col => {
    const header = col.querySelector('.column-header').textContent;
    lines.push(`## ${header}`);
    const cards = col.querySelectorAll('.card:not(.hidden)');
    if (cards.length === 0) {
      lines.push('_(vazio)_');
    } else {
      cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent;
        const descEl = card.querySelector('.card-desc');
        lines.push(`- ${title}${descEl ? ` — ${descEl.textContent}` : ''}`);
      });
    }
    lines.push('');
  });
  const ts = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  lines.push(`---\nExportado em ${ts}`);
  return lines.join('\n').trim();
}

function toggleColumnCollapse(columnEl) {
  columnEl.classList.toggle('column--collapsed');
}

function buildCalendarUrl(title, desc, dateStr) {
  const d = parsePtBrDate(dateStr);
  const pad = n => String(n).padStart(2, '0');
  const base = 'https://www.google.com/calendar/event?action=TEMPLATE';
  const params = `&text=${encodeURIComponent(title)}${desc ? '&details=' + encodeURIComponent(desc) : ''}`;
  const dates = d ? `&dates=${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}/${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` : '';
  return base + params + dates;
}

function buildIcsContent(title, desc, dateStr) {
  const d = parsePtBrDate(dateStr) || new Date();
  const pad = n => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const ymdn = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sprint Board//EN',
    'BEGIN:VEVENT',
    `UID:sprint-board-${Date.now()}@app`,
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${ymdn}`,
    `SUMMARY:${title}`,
    desc ? `DESCRIPTION:${desc}` : null,
    'END:VEVENT', 'END:VCALENDAR'
  ].filter(Boolean);
  return lines.join('\r\n');
}

function markTerms(text, terms) {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  terms.forEach(t => {
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    html = html.replace(re, m => `<mark>${m}</mark>`);
  });
  return html;
}

function markMatch(text, query) {
  return markTerms(text, [query]);
}

function filterCards(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;
  document.querySelectorAll('.card').forEach(card => {
    const title = card.dataset.title || '';
    const desc = card.dataset.desc || '';
    const priority = (card.dataset.priority || '').toLowerCase();
    const combined = title.toLowerCase() + ' ' + desc.toLowerCase() + ' ' + priority;
    const hidden = terms.length > 0 && !terms.every(t => combined.includes(t));
    card.classList.toggle('hidden', hidden);
    const titleEl = card.querySelector('.card-title');
    const descEl = card.querySelector('.card-desc');
    if (!hidden && terms.length > 0) {
      titleEl.innerHTML = markTerms(title, terms);
      if (descEl) descEl.innerHTML = markTerms(desc, terms);
    } else {
      titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
    }
    if (!hidden) visible++;
  });
  document.querySelectorAll('.column-body').forEach(body => {
    const cards = Array.from(body.querySelectorAll('.card'));
    const allHidden = cards.length > 0 && cards.every(c => c.classList.contains('hidden'));
    let emptyEl = body.querySelector('.filter-empty');
    if (terms.length > 0 && allHidden) {
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'filter-empty';
        emptyEl.textContent = 'Sem resultados';
        body.appendChild(emptyEl);
      }
    } else if (emptyEl) {
      emptyEl.remove();
    }
  });
  return visible;
}

function showState(state, msg) {
  document.getElementById('state-idle').classList.add('hidden');
  document.getElementById('state-loading').classList.add('hidden');
  document.getElementById('state-error').classList.add('hidden');
  document.getElementById('board').classList.add('hidden');
  document.getElementById('refresh-btn').classList.add('hidden');
  document.getElementById('copy-link-btn').classList.add('hidden');
  document.getElementById('copy-sheet-btn').classList.add('hidden');
  document.getElementById('new-task-btn').classList.add('hidden');
  document.getElementById('auto-refresh-controls').classList.add('hidden');
  document.getElementById('board-summary').classList.add('hidden');
  document.getElementById('sprint-progress').classList.add('hidden');
  document.getElementById('filter-count').classList.add('hidden');
  document.getElementById('download-btn').classList.add('hidden');
  document.getElementById('json-btn').classList.add('hidden');
  document.getElementById('csv-btn').classList.add('hidden');
  document.getElementById('sort-btn').classList.add('hidden');
  document.getElementById('date-sort-btn').classList.add('hidden');
  document.getElementById('title-sort-btn').classList.add('hidden');
  document.getElementById('export-btn').classList.add('hidden');
  document.getElementById('compact-btn').classList.add('hidden');
  document.getElementById('focus-btn').classList.add('hidden');
  document.getElementById('reset-btn').classList.add('hidden');

  const filterRow = document.getElementById('filter-row');
  filterRow.classList.add('hidden');
  const filterInput = document.getElementById('filter-input');
  filterInput.value = '';
  document.getElementById('filter-clear-btn').classList.add('hidden');
  filterCards('');

  if (state === 'idle') {
    document.getElementById('state-idle').classList.remove('hidden');
  } else if (state === 'loading') {
    document.getElementById('state-loading').classList.remove('hidden');
  } else if (state === 'error') {
    const el = document.getElementById('state-error');
    el.textContent = msg || 'Ocorreu um erro.';
    el.classList.remove('hidden');
  } else if (state === 'success') {
    document.getElementById('board').classList.remove('hidden');
    document.getElementById('refresh-btn').classList.remove('hidden');
    document.getElementById('copy-link-btn').classList.remove('hidden');
    document.getElementById('copy-sheet-btn').classList.remove('hidden');
    document.getElementById('new-task-btn').classList.remove('hidden');
    filterRow.classList.remove('hidden');
    document.getElementById('auto-refresh-controls').classList.remove('hidden');
    document.getElementById('board-summary').classList.remove('hidden');
    document.getElementById('sprint-progress').classList.remove('hidden');
    document.getElementById('download-btn').classList.remove('hidden');
    document.getElementById('json-btn').classList.remove('hidden');
    document.getElementById('csv-btn').classList.remove('hidden');
    document.getElementById('sort-btn').classList.remove('hidden');
    document.getElementById('date-sort-btn').classList.remove('hidden');
    document.getElementById('title-sort-btn').classList.remove('hidden');
    document.getElementById('export-btn').classList.remove('hidden');
    document.getElementById('compact-btn').classList.remove('hidden');
    document.getElementById('focus-btn').classList.remove('hidden');
    document.getElementById('reset-btn').classList.remove('hidden');
  }
}

function openCardDetail(card) {
  const { title, desc, date, priority } = card.dataset;
  document.getElementById('card-detail-title').textContent = title;
  const descEl = document.getElementById('card-detail-desc');
  descEl.textContent = desc;
  descEl.classList.toggle('hidden', !desc);
  const colName = card.closest('.column').querySelector('.column-header').textContent.replace(/ \(\d+\)$/, '');
  const colEl = document.getElementById('card-detail-column');
  colEl.textContent = `Coluna: ${colName}`;
  colEl.classList.remove('hidden');
  const dateEl = document.getElementById('card-detail-date');
  if (date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsed = parsePtBrDate(date);
    const delta = parsed ? Math.round((parsed - today) / MS_PER_DAY) : null;
    const suffix = delta === null ? '' : delta > 0 ? ` · em ${delta} dia${delta !== 1 ? 's' : ''}` : delta < 0 ? ` · vencida há ${Math.abs(delta)} dia${Math.abs(delta) !== 1 ? 's' : ''}` : ' · hoje';
    dateEl.textContent = `Data: ${date}${suffix}`;
  }
  dateEl.classList.toggle('hidden', !date);
  const prioEl = document.getElementById('card-detail-priority');
  prioEl.textContent = priority ? `Prioridade: ${priority}` : '';
  prioEl.classList.toggle('hidden', !priority);
  document.getElementById('card-detail-overlay').classList.remove('hidden');
}

function closeCardDetail() {
  document.getElementById('card-detail-overlay').classList.add('hidden');
}

function openNewTaskModal() {
  const taskName = document.getElementById('task-name');
  taskName.value = '';
  taskName.classList.remove('input--invalid');
  document.getElementById('task-name-count').textContent = '0 / 80';
  const taskDesc = document.getElementById('task-desc');
  taskDesc.value = '';
  taskDesc.style.height = 'auto';
  document.getElementById('task-desc-count').textContent = `0 / ${TASK_DESC_MAX}`;
  document.getElementById('task-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('task-priority').value = '';
  document.getElementById('modal-feedback').classList.add('hidden');
  document.getElementById('modal-submit').disabled = false;
  document.getElementById('new-task-overlay').classList.remove('hidden');
  taskName.focus();
}

function closeNewTaskModal() {
  document.getElementById('new-task-overlay').classList.add('hidden');
}

function submitNewTask() {
  const taskNameEl = document.getElementById('task-name');
  const name = taskNameEl.value.trim();
  if (!name) {
    taskNameEl.classList.add('input--invalid');
    taskNameEl.focus();
    return;
  }

  const desc = document.getElementById('task-desc').value.trim();
  const isoDate = document.getElementById('task-date').value;
  const date = isoDate ? isoDate.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
  const priority = document.getElementById('task-priority').value;
  const tsv = `${name}\t${desc}\t${date}\t${priority}`;

  navigator.clipboard.writeText(tsv).then(() => {
    const feedback = document.getElementById('modal-feedback');
    feedback.textContent = 'Copiado! Abrindo planilha...';
    feedback.classList.remove('hidden');
    document.getElementById('modal-submit').disabled = true;
    setTimeout(() => {
      window.open(document.getElementById('sheet-url').value);
      closeNewTaskModal();
    }, 1000);
  });
}

function toggleHelp() {
  document.getElementById('help-overlay').classList.toggle('hidden');
}

function populateSelect() {
  const select = document.getElementById('sheet-select');
  Object.entries(SHEETS_MAP).forEach(([name, url]) => {
    const opt = document.createElement('option');
    opt.value = url;
    opt.textContent = name;
    select.appendChild(opt);
  });
}
