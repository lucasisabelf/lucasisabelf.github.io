const PRIORITY_CLASS = { 'Alta': 'priority--high', 'Média': 'priority--mid', 'Baixa': 'priority--low' };
const PRIORITY_ORDER = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };

function flashButton(btn, tempText) {
  const original = btn.textContent;
  btn.textContent = tempText;
  setTimeout(() => { btn.textContent = original; }, 2000);
}

function parsePtBrDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
  return isNaN(d) ? null : d;
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
    const parsed = new Date(date);
    if (!isNaN(parsed) && parsed < today) dt.classList.add('card-date--overdue');
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
}

function renderSummary(counts, overdue) {
  const total = counts.reduce((s, n) => s + n, 0);
  let text = `${total} total · ${counts[1]} em andamento · ${counts[2]} concluídas`;
  if (overdue > 0) text += ` · ${overdue} vencida${overdue !== 1 ? 's' : ''}`;
  document.getElementById('board-summary').textContent = text;
}

function sortByPriority(rows) {
  return [...rows].sort((a, b) =>
    (PRIORITY_ORDER[a[3]] ?? 3) - (PRIORITY_ORDER[b[3]] ?? 3)
  );
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
  return lines.join('\n').trim();
}

function toggleColumnCollapse(columnEl) {
  columnEl.classList.toggle('column--collapsed');
}

function filterCards(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const descEl = card.querySelector('.card-desc');
    const desc = descEl ? descEl.textContent.toLowerCase() : '';
    card.classList.toggle('hidden', q !== '' && !title.includes(q) && !desc.includes(q));
  });
}

function showState(state, msg) {
  document.getElementById('state-idle').classList.add('hidden');
  document.getElementById('state-loading').classList.add('hidden');
  document.getElementById('state-error').classList.add('hidden');
  document.getElementById('board').classList.add('hidden');
  document.getElementById('refresh-btn').classList.add('hidden');
  document.getElementById('copy-link-btn').classList.add('hidden');
  document.getElementById('new-task-btn').classList.add('hidden');
  document.getElementById('auto-refresh-controls').classList.add('hidden');
  document.getElementById('board-summary').classList.add('hidden');
  document.getElementById('sort-btn').classList.add('hidden');
  document.getElementById('date-sort-btn').classList.add('hidden');
  document.getElementById('export-btn').classList.add('hidden');
  document.getElementById('compact-btn').classList.add('hidden');
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
    document.getElementById('new-task-btn').classList.remove('hidden');
    filterRow.classList.remove('hidden');
    document.getElementById('auto-refresh-controls').classList.remove('hidden');
    document.getElementById('board-summary').classList.remove('hidden');
    document.getElementById('sort-btn').classList.remove('hidden');
    document.getElementById('date-sort-btn').classList.remove('hidden');
    document.getElementById('export-btn').classList.remove('hidden');
    document.getElementById('compact-btn').classList.remove('hidden');
    document.getElementById('reset-btn').classList.remove('hidden');
  }
}

function openNewTaskModal() {
  const taskName = document.getElementById('task-name');
  taskName.value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('modal-feedback').classList.add('hidden');
  document.getElementById('modal-submit').disabled = false;
  document.getElementById('new-task-overlay').classList.remove('hidden');
  taskName.focus();
}

function closeNewTaskModal() {
  document.getElementById('new-task-overlay').classList.add('hidden');
}

function submitNewTask() {
  const name = document.getElementById('task-name').value.trim();
  if (!name) return;

  const desc = document.getElementById('task-desc').value.trim();
  const isoDate = document.getElementById('task-date').value;
  const date = isoDate ? isoDate.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
  const tsv = `${name}\t${desc}\t${date}`;

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

function populateSelect() {
  const select = document.getElementById('sheet-select');
  Object.entries(SHEETS_MAP).forEach(([name, url]) => {
    const opt = document.createElement('option');
    opt.value = url;
    opt.textContent = name;
    select.appendChild(opt);
  });
}
