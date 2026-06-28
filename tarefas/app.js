const SHEET_NAMES = ['To Do', 'In Progress', 'Done'];
const COLUMN_BODIES = ['body-todo', 'body-progress', 'body-done'];

const SHEETS_MAP = {
  'Lucas': 'https://docs.google.com/spreadsheets/d/1pwp4yeXAGXXghSW_tR9gqeaDI0vOOBmuL3-hYKsnzmk/edit?usp=sharing',

  'Aline': 'https://docs.google.com/spreadsheets/d/1PrSsBgK5M0SoxYM2cJk7_GpIieNKzbeF2NQQmahvtpk/edit?usp=sharing'
};

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function buildSheetUrl(id, sheetName) {
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=0&range=A3:C&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCsv(text) {
  const rows = [];
  const re = /("(?:[^"]|"")*"|[^,\r\n]*)(,|\r?\n|\r|$)/g;
  let row = [];
  let match;
  while ((match = re.exec(text)) !== null) {
    let field = match[1];
    const delim = match[2];
    if (field.startsWith('"') && field.endsWith('"')) {
      field = field.slice(1, -1).replace(/""/g, '"');
    }
    row.push(field);
    if (delim !== ',') {
      rows.push(row);
      row = [];
    }
    if (match[0] === '') break;
  }
  return rows;
}

function filterRows(rows) {
  return rows.filter(r => r[0] && r[0].trim() !== '');
}

function renderCard(row) {
  const name = row[0].trim();
  const desc = row[1] ? row[1].trim() : '';
  const date = row[2] ? row[2].trim() : '';

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
    card.appendChild(dt);
  }

  return card;
}

function renderColumn(bodyId, rows) {
  const body = document.getElementById(bodyId);
  body.innerHTML = '';

  if (rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-column';
    empty.textContent = 'Nenhuma tarefa';
    body.appendChild(empty);
    return;
  }

  rows.forEach(row => body.appendChild(renderCard(row)));
}

function showState(state, msg) {
  document.getElementById('state-idle').classList.add('hidden');
  document.getElementById('state-loading').classList.add('hidden');
  document.getElementById('state-error').classList.add('hidden');
  document.getElementById('board').classList.add('hidden');

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
  }
}

async function handleSubmit() {
  const input = document.getElementById('sheet-url').value.trim();
  const id = extractSheetId(input);

  if (!id) {
    showState('error', 'URL inválida. Cole o link de compartilhamento do Google Sheets.');
    return;
  }

  showState('loading');
  document.getElementById('edit-link').classList.add('hidden');

  try {
    const fetches = SHEET_NAMES.map(async (name, i) => {
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

    results.forEach((rows, i) => renderColumn(COLUMN_BODIES[i], rows));

    showState('success');

    const editLink = document.getElementById('edit-link');
    editLink.href = input;
    editLink.classList.remove('hidden');
  } catch (err) {
    showState('error', err.message || 'Erro ao carregar a planilha. Verifique a URL e a visibilidade da planilha.');
  }
}

function populateSelect() {
  const select = document.getElementById('sheet-select');
  Object.entries(SHEETS_MAP).forEach(([name, url]) => {
    const opt = document.createElement('option');
    opt.value = url;
    opt.textContent = name;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    if (select.value) {
      document.getElementById('sheet-url').value = select.value;
    }
  });
}

document.getElementById('load-btn').addEventListener('click', handleSubmit);
document.getElementById('sheet-url').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSubmit();
});

populateSelect();
