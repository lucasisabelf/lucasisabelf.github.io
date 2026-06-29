let refreshTimer;
let sortEnabled = false;
let dateSortEnabled = false;
let compactMode = false;

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
      const res = await fetch(url);
      if (!res.ok) return [];
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('A planilha retornou HTML. Verifique se ela está compartilhada como "Qualquer pessoa com o link pode ver".');
      }
      const text = await res.text();
      return filterRows(parseCsv(text));
    });

    const results = await Promise.all(fetches);

    document.title = results[1].length > 0
      ? `Sprint Board — ${results[1].length} em andamento`
      : 'Sprint Board';

    const orderedResults = results.map(rows => {
      if (sortEnabled) return sortByPriority(rows);
      if (dateSortEnabled) return sortByDate(rows);
      return rows;
    });
    orderedResults.forEach((rows, i) => renderColumn(COLUMN_BODIES[i], rows));
    renderSummary(results.map(r => r.length), countOverdue());

    showState('success');

    editLink.href = input;
    editLink.classList.remove('hidden');

    localStorage.setItem('lastSheet', input);
    history.replaceState(null, '', `?sheet=${encodeURIComponent(input)}`);

    if (document.getElementById('auto-refresh').checked) {
      const intervalMs = parseInt(document.getElementById('refresh-interval').value, 10) * 60000;
      refreshTimer = setInterval(handleSubmit, intervalMs);
    }
  } catch (err) {
    showState('error', err.message || 'Erro ao carregar a planilha. Verifique a URL e a visibilidade da planilha.');
  }
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

function buildCalendarUrl(title, desc, dateStr) {
  const d = parsePtBrDate(dateStr);
  if (!d) return 'https://calendar.google.com/calendar/r/eventedit' + (title ? `?text=${encodeURIComponent(title)}` : '');
  const pad = n => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&details=${encodeURIComponent(desc)}&dates=${ymd}/${ymd}`;
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
    window.open(buildCalendarUrl(title, desc, date));
  }
});

document.getElementById('date-sort-btn').addEventListener('click', () => {
  dateSortEnabled = !dateSortEnabled;
  if (dateSortEnabled) { sortEnabled = false; document.getElementById('sort-btn').classList.remove('header-action-btn--active'); document.getElementById('sort-btn').textContent = 'Ordenar por prioridade'; localStorage.setItem('sortEnabled', false); }
  const btn = document.getElementById('date-sort-btn');
  btn.textContent = dateSortEnabled ? 'Ordem original' : 'Ordenar por data';
  btn.classList.toggle('header-action-btn--active', dateSortEnabled);
  localStorage.setItem('dateSortEnabled', dateSortEnabled);
  handleSubmit();
});

document.getElementById('compact-btn').addEventListener('click', () => {
  compactMode = !compactMode;
  document.getElementById('board').classList.toggle('board--compact', compactMode);
  document.getElementById('compact-btn').classList.toggle('header-action-btn--active', compactMode);
  localStorage.setItem('compactMode', compactMode);
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
document.getElementById('export-btn').addEventListener('click', exportBoardText);
document.getElementById('sort-btn').addEventListener('click', () => {
  sortEnabled = !sortEnabled;
  const sortBtn = document.getElementById('sort-btn');
  sortBtn.textContent = sortEnabled ? 'Ordem original' : 'Ordenar por prioridade';
  sortBtn.classList.toggle('header-action-btn--active', sortEnabled);
  localStorage.setItem('sortEnabled', sortEnabled);
  handleSubmit();
});
document.querySelectorAll('.column-header').forEach(h => {
  h.addEventListener('click', () => toggleColumnCollapse(h.closest('.column')));
});
document.getElementById('filter-input').addEventListener('input', e => {
  filterCards(e.target.value);
  document.getElementById('filter-clear-btn').classList.toggle('hidden', e.target.value === '');
});
document.getElementById('filter-clear-btn').addEventListener('click', () => {
  const filterInput = document.getElementById('filter-input');
  filterInput.value = '';
  filterCards('');
  document.getElementById('filter-clear-btn').classList.add('hidden');
  filterInput.focus();
});
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
  if (e.key === 'Escape') { closeNewTaskModal(); return; }
  const boardVisible = !document.getElementById('board').classList.contains('hidden');
  const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
  if (!boardVisible || inInput) return;
  if (e.key === 'r' || e.key === 'R') handleSubmit();
  if (e.key === 'f' || e.key === 'F') document.getElementById('filter-input').focus();
  if (e.key === 'n' || e.key === 'N') openNewTaskModal();
});

populateSelect();
initTheme();

if (localStorage.getItem('sortEnabled') === 'true') {
  sortEnabled = true;
  const sortBtn = document.getElementById('sort-btn');
  sortBtn.textContent = 'Ordem original';
  sortBtn.classList.add('header-action-btn--active');
}
if (localStorage.getItem('dateSortEnabled') === 'true') {
  dateSortEnabled = true;
  const btn = document.getElementById('date-sort-btn');
  btn.textContent = 'Ordem original';
  btn.classList.add('header-action-btn--active');
}
if (localStorage.getItem('compactMode') === 'true') {
  compactMode = true;
  document.getElementById('board').classList.add('board--compact');
  document.getElementById('compact-btn').classList.add('header-action-btn--active');
}

const urlSheet = new URLSearchParams(location.search).get('sheet');
const autoLoadUrl = urlSheet || localStorage.getItem('lastSheet');
if (autoLoadUrl) {
  document.getElementById('sheet-url').value = autoLoadUrl;
  handleSubmit();
}
