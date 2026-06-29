const PRIORITY_CLASS = { 'Alta': 'priority--high', 'Média': 'priority--mid', 'Baixa': 'priority--low' };

function renderCard(row) {
  const name = row[0].trim();
  const desc = row[1] ? row[1].trim() : '';
  const date = row[2] ? row[2].trim() : '';
  const priority = row[3] ? row[3].trim() : '';

  const card = document.createElement('div');
  card.className = 'card';

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

  const filterInput = document.getElementById('filter-input');
  filterInput.classList.add('hidden');
  filterInput.value = '';
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
    filterInput.classList.remove('hidden');
    document.getElementById('auto-refresh-controls').classList.remove('hidden');
  }
}

function openNewTaskModal() {
  const taskName = document.getElementById('task-name');
  taskName.value = '';
  document.getElementById('task-desc').value = '';
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
  const date = new Date().toLocaleDateString('pt-BR');
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
