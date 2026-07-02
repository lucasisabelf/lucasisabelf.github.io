const PRIORITY_CLASS = { 'Alta': 'priority--high', 'Média': 'priority--mid', 'Baixa': 'priority--low' };
const PRIORITY_ORDER = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };
const DAYS_UNTIL_WARNING = 3;
const TASK_DESC_MAX = 300;
const MS_PER_DAY = 86400000;

const OVERDUE_STAGES = [
  { minDays: 14, stage: 4 },
  { minDays: 7,  stage: 3 },
  { minDays: 3,  stage: 2 },
  { minDays: 1,  stage: 1 },
];

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

function toIsoDate(ptBrDate) {
  const [d, m, y] = (ptBrDate || '').split('/');
  return d && m && y ? `${y}-${m}-${d}` : '';
}

function toPtBrDate(isoDate) {
  return isoDate ? isoDate.split('-').reverse().join('/') : '';
}

function parseChecklist(desc) {
  const items = (desc || '').split('\n')
    .map(line => line.match(/^-\s*\[([ xX])\]\s*(.+)$/))
    .filter(Boolean)
    .map(match => ({ done: match[1].toLowerCase() === 'x', text: match[2] }));
  return items.length ? items : null;
}

function overdueStage(daysLate) {
  for (const { minDays, stage } of OVERDUE_STAGES) {
    if (daysLate >= minDays) return stage;
  }
  return 0;
}

function renderCard(row, daysInColumn, isNew) {
  const name = row[0].trim();
  const desc = row[1] ? row[1].trim() : '';
  const date = row[2] ? row[2].trim() : '';
  const priority = row[3] ? row[3].trim() : '';
  const responsavel = row[4] ? row[4].trim() : '';
  const linkRaw = row[5] ? row[5].trim() : '';
  const link = /^https?:\/\//i.test(linkRaw) ? linkRaw : '';
  const tagsRaw = row[6] ? row[6].trim() : '';

  const card = document.createElement('div');
  card.className = responsavel ? 'card' : 'card card--unassigned';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.dataset.title = name;
  card.dataset.desc = desc;
  card.dataset.date = date;
  card.dataset.priority = priority;
  card.dataset.responsavel = responsavel;
  card.dataset.link = link;
  card.dataset.tags = tagsRaw;
  if (daysInColumn !== undefined) card.dataset.daysInColumn = daysInColumn;

  const selectCheckbox = document.createElement('input');
  selectCheckbox.type = 'checkbox';
  selectCheckbox.className = 'card-select-checkbox';
  card.appendChild(selectCheckbox);

  if (isNew) {
    const newBadge = document.createElement('span');
    newBadge.className = 'card-new-badge';
    newBadge.textContent = 'Novo';
    card.appendChild(newBadge);
  }

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = name;
  card.appendChild(title);

  const checklist = parseChecklist(desc);
  if (checklist) {
    const progress = document.createElement('span');
    progress.className = 'card-checklist-progress';
    progress.textContent = `${checklist.filter(i => i.done).length}/${checklist.length}`;
    title.appendChild(progress);

    const list = document.createElement('ul');
    list.className = 'card-checklist';
    checklist.forEach(({ done, text }) => {
      const item = document.createElement('li');
      item.className = 'card-checklist-item';
      item.textContent = `${done ? '☑' : '☐'} ${text}`;
      list.appendChild(item);
    });
    card.appendChild(list);
  } else if (desc) {
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
      if (delta < 0) card.dataset.overdueStage = overdueStage(Math.abs(delta));
    } else {
      dt.classList.add('card-date--invalid');
      dt.title = 'Formato de data não reconhecido — use DD/MM/AAAA';
    }
    card.appendChild(dt);
  }

  if (priority && PRIORITY_CLASS[priority]) {
    const badge = document.createElement('span');
    badge.className = `card-priority ${PRIORITY_CLASS[priority]}`;
    badge.textContent = priority;
    card.appendChild(badge);
  }

  if (responsavel) {
    const badge = document.createElement('span');
    badge.className = 'card-responsavel';
    badge.textContent = responsavel;
    card.appendChild(badge);
  }

  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  if (tags.length) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'card-tags';
    tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'card-tag';
      chip.textContent = tag;
      tagsEl.appendChild(chip);
    });
    card.appendChild(tagsEl);
  }

  if (daysInColumn > 0) {
    const columnTime = document.createElement('span');
    columnTime.className = 'card-column-time text-xs text-empty-col';
    columnTime.textContent = `há ${daysInColumn} dia${daysInColumn !== 1 ? 's' : ''}`;
    card.appendChild(columnTime);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'card-action-btn card-copy-btn';
  copyBtn.textContent = 'Copiar';
  actions.appendChild(copyBtn);

  if (link) {
    const linkEl = document.createElement('a');
    linkEl.className = 'card-action-btn card-link';
    linkEl.href = link;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.textContent = '🔗';
    actions.appendChild(linkEl);
  }

  const moreBtn = document.createElement('button');
  moreBtn.className = 'card-action-btn card-more-btn';
  moreBtn.textContent = 'Mais ▾';
  actions.appendChild(moreBtn);

  const morePanel = document.createElement('div');
  morePanel.className = 'card-more-panel export-menu-panel hidden';

  const askBtn = document.createElement('button');
  askBtn.className = 'card-action-btn card-ask-claude-btn';
  askBtn.textContent = 'Sugerir ao Claude';
  morePanel.appendChild(askBtn);

  const calBtn = document.createElement('button');
  calBtn.className = 'card-action-btn card-calendar-btn';
  calBtn.textContent = '+ Agenda';
  morePanel.appendChild(calBtn);

  const whatsappBtn = document.createElement('button');
  whatsappBtn.className = 'card-action-btn card-whatsapp-btn';
  whatsappBtn.textContent = 'WhatsApp';
  morePanel.appendChild(whatsappBtn);

  const dupBtn = document.createElement('button');
  dupBtn.className = 'card-action-btn card-duplicate-btn';
  dupBtn.textContent = 'Duplicar';
  morePanel.appendChild(dupBtn);

  actions.appendChild(morePanel);
  card.appendChild(actions);

  return card;
}

function renderColumn(bodyId, rows, daysByTitle, newTitles) {
  const body = document.getElementById(bodyId);
  body.innerHTML = '';

  const header = body.closest('.column').querySelector('.column-header');
  header.textContent = header.textContent.replace(/ \(\d+\)$/, '') + (rows.length > 0 ? ` (${rows.length})` : '');

  if (rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-column';
    empty.textContent = 'Nenhuma tarefa';
    const cta = document.createElement('button');
    cta.className = 'empty-column-cta';
    cta.textContent = '+ Nova Tarefa';
    empty.appendChild(cta);
    body.appendChild(empty);
    return;
  }

  rows.forEach(row => body.appendChild(renderCard(row, daysByTitle && daysByTitle.get(row[0].trim()), newTitles && newTitles.has(row[0].trim()))));
  body.scrollTop = 0;
}

function renderListItemCard(row) {
  const nome = row[0].trim();
  const topico = row[1] ? row[1].trim() : '';
  const prioridade = row[2] ? row[2].trim() : '';
  const status = row[3] ? row[3].trim() : '';
  const motivo = row[4] ? row[4].trim() : '';

  const card = document.createElement('div');
  card.className = 'study-card';

  const title = document.createElement('div');
  title.className = 'study-card-name';
  title.textContent = nome;
  card.appendChild(title);

  if (topico) {
    const t = document.createElement('div');
    t.className = 'study-card-topico';
    t.textContent = topico;
    card.appendChild(t);
  }

  const meta = document.createElement('div');
  meta.className = 'study-card-meta';

  if (prioridade && PRIORITY_CLASS[prioridade]) {
    const badge = document.createElement('span');
    badge.className = `card-priority ${PRIORITY_CLASS[prioridade]}`;
    badge.textContent = prioridade;
    meta.appendChild(badge);
  }

  if (status) {
    const s = document.createElement('span');
    s.className = 'study-card-status';
    s.textContent = status;
    meta.appendChild(s);
  }

  if (meta.children.length) card.appendChild(meta);

  if (motivo) {
    const m = document.createElement('div');
    m.className = 'study-card-motivo';
    m.textContent = motivo;
    card.appendChild(m);
  }

  return card;
}

function renderExtraLists(lists) {
  const container = document.getElementById('extra-lists');
  container.innerHTML = '';

  lists.forEach(({ name, rows }) => {
    const panel = document.createElement('div');
    panel.className = 'study-panel hidden';
    panel.dataset.listName = name;

    const title = document.createElement('h2');
    title.className = 'study-panel-title';
    title.textContent = name;
    panel.appendChild(title);

    const body = document.createElement('div');
    body.className = 'study-body';

    if (rows.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-column';
      empty.textContent = 'Nenhum item nesta lista';
      body.appendChild(empty);
    } else {
      rows.forEach(row => body.appendChild(renderListItemCard(row)));
    }

    panel.appendChild(body);
    container.appendChild(panel);
  });
}

function renderActivityFeed(log) {
  const list = document.getElementById('activity-feed-list');
  list.innerHTML = '';

  if (log.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-column';
    empty.textContent = 'Nenhuma atividade registrada ainda';
    list.appendChild(empty);
    return;
  }

  log.forEach(({ title, from, to }) => {
    const item = document.createElement('li');
    item.className = 'activity-item';
    item.textContent = `${title}: ${from} → ${to}`;
    list.appendChild(item);
  });
}

function updateActivityBadge(unseenCount) {
  document.getElementById('activity-btn').textContent = `Atividade${unseenCount > 0 ? ` (${unseenCount})` : ''}`;
}

function updateSelectedCount(count) {
  document.getElementById('selected-count').textContent = `${count} selecionado${count !== 1 ? 's' : ''}`;
}

function renderSummary(counts, overdue, warning) {
  const total = counts.reduce((s, n) => s + n, 0);
  if (total === 0) {
    document.getElementById('board-summary').textContent = 'Nenhuma tarefa encontrada — confira se os dados começam na linha 3 e se os nomes das abas conferem.';
    document.getElementById('sprint-progress-bar').style.width = '0%';
    document.title = 'Sprint Board';
    return;
  }
  let text = `${total} total · ${counts[1]} em andamento · ${counts[2]} concluídas`;
  if (overdue > 0) {
    text += ` · ${overdue} vencida${overdue !== 1 ? 's' : ''}`;
    const overdueByResponsavel = {};
    document.querySelectorAll('.card-date--overdue').forEach(dt => {
      const responsavel = dt.closest('.card').dataset.responsavel;
      if (responsavel) overdueByResponsavel[responsavel] = (overdueByResponsavel[responsavel] || 0) + 1;
    });
    const breakdown = Object.entries(overdueByResponsavel)
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ');
    if (breakdown) text += ` (${breakdown})`;
  }
  if (warning > 0) text += ` · ${warning} com prazo próximo`;
  const alta = countByPriority('Alta');
  const media = countByPriority('Média');
  const baixa = countByPriority('Baixa');
  if (alta > 0 || media > 0 || baixa > 0) text += ` · Alta: ${alta} · Média: ${media} · Baixa: ${baixa}`;
  const inProgressDays = Array.from(document.querySelectorAll('#body-progress .card'))
    .map(card => Number(card.dataset.daysInColumn))
    .filter(days => !isNaN(days));
  if (inProgressDays.length > 0) {
    const avgDays = Math.round(inProgressDays.reduce((s, d) => s + d, 0) / inProgressDays.length);
    text += ` · Tempo médio em andamento: ${avgDays} dia${avgDays !== 1 ? 's' : ''}`;
  }
  const hhmm = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  text += ` · Atualizado às ${hhmm}`;
  document.getElementById('board-summary').textContent = text;
  const pct = total > 0 ? Math.round((counts[2] / total) * 100) : 0;
  document.getElementById('sprint-progress-bar').style.width = pct + '%';
  document.title = alta > 0 ? `⚠ ${alta} · Sprint Board · ${pct}%` : pct > 0 ? `Sprint Board · ${pct}%` : 'Sprint Board';
}

function compareByDate(a, b) {
  const da = parsePtBrDate(a[2]);
  const db = parsePtBrDate(b[2]);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da - db;
}

function sortByPriority(rows) {
  return [...rows].sort((a, b) =>
    (PRIORITY_ORDER[a[3]] ?? 3) - (PRIORITY_ORDER[b[3]] ?? 3) || compareByDate(a, b)
  );
}

function sortByTitle(rows) {
  return [...rows].sort((a, b) => (a[0] || '').localeCompare(b[0] || '', 'pt-BR'));
}

function sortByDate(rows) {
  return [...rows].sort(compareByDate);
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
        const { title, desc } = card.dataset;
        lines.push(`- ${title}${desc ? ` — ${desc}` : ''}`);
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

function buildCardSummaryText(title, desc, date, priority) {
  return `${title}${desc ? ' — ' + desc : ''}${date ? ' · ' + date : ''}${priority ? ' [' + priority + ']' : ''}`;
}

function buildWhatsAppUrl(title, desc, date, priority) {
  return `https://wa.me/?text=${encodeURIComponent(buildCardSummaryText(title, desc, date, priority))}`;
}

function buildCalendarUrl(title, desc, dateStr) {
  const d = parsePtBrDate(dateStr);
  const pad = n => String(n).padStart(2, '0');
  const base = 'https://www.google.com/calendar/event?action=TEMPLATE';
  const params = `&text=${encodeURIComponent(title)}${desc ? '&details=' + encodeURIComponent(desc) : ''}`;
  const dates = d ? `&dates=${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}/${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` : '';
  return base + params + dates;
}

function escapeIcsText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function buildIcsEvent(title, desc, dateStr, uid) {
  const d = parsePtBrDate(dateStr) || new Date();
  const pad = n => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const ymdn = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@app`,
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${ymdn}`,
    `SUMMARY:${escapeIcsText(title)}`,
    desc ? `DESCRIPTION:${escapeIcsText(desc)}` : null,
    'END:VEVENT'
  ].filter(Boolean);
}

function buildIcsContent(title, desc, dateStr) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sprint Board//EN',
    ...buildIcsEvent(title, desc, dateStr, `sprint-board-${Date.now()}`),
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
}

function buildIcsCalendar(events) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sprint Board//EN',
    ...events.flatMap((e, i) => buildIcsEvent(e.title, e.desc, e.date, `sprint-board-${Date.now()}-${i}`)),
    'END:VCALENDAR'
  ];
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

function filterCards(query, responsavelFilter = '') {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtering = terms.length > 0 || responsavelFilter !== '';
  let visible = 0;
  document.querySelectorAll('.card').forEach(card => {
    const title = card.dataset.title || '';
    const desc = card.dataset.desc || '';
    const priority = (card.dataset.priority || '').toLowerCase();
    const responsavel = card.dataset.responsavel || '';
    const tags = (card.dataset.tags || '').toLowerCase();
    const combined = title.toLowerCase() + ' ' + desc.toLowerCase() + ' ' + priority + ' ' + responsavel.toLowerCase() + ' ' + tags;
    const matchesQuery = terms.length === 0 || terms.every(t => combined.includes(t));
    const matchesResponsavel = !responsavelFilter || responsavel === responsavelFilter;
    const hidden = !matchesQuery || !matchesResponsavel;
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
    if (filtering && allHidden) {
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
  document.getElementById('new-task-btn').classList.add('hidden');
  document.getElementById('board-summary').classList.add('hidden');
  document.getElementById('sprint-progress').classList.add('hidden');
  document.getElementById('filter-count').classList.add('hidden');
  document.getElementById('share-menu-btn').classList.add('hidden');
  document.getElementById('share-menu-panel').classList.add('hidden');
  document.getElementById('export-menu-btn').classList.add('hidden');
  document.getElementById('export-menu-panel').classList.add('hidden');
  document.getElementById('sort-select').classList.add('hidden');
  document.getElementById('view-menu-btn').classList.add('hidden');
  document.getElementById('reset-btn').classList.add('hidden');
  document.getElementById('extra-lists').classList.add('hidden');
  document.getElementById('activity-btn').classList.add('hidden');
  document.getElementById('activity-panel').classList.add('hidden');
  document.getElementById('select-mode-btn').classList.add('hidden');
  document.getElementById('select-mode-btn').classList.remove('header-action-btn--active');
  document.getElementById('bulk-actions-bar').classList.add('hidden');
  document.getElementById('board').classList.remove('board--selecting');
  document.getElementById('mode-select').classList.add('hidden');

  const filterRow = document.getElementById('filter-row');
  filterRow.classList.add('hidden');
  const filterInput = document.getElementById('filter-input');
  filterInput.value = '';
  document.getElementById('filter-clear-btn').classList.add('hidden');
  document.getElementById('responsavel-filter').value = '';
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
    document.getElementById('new-task-btn').classList.remove('hidden');
    filterRow.classList.remove('hidden');
    document.getElementById('board-summary').classList.remove('hidden');
    document.getElementById('sprint-progress').classList.remove('hidden');
    document.getElementById('share-menu-btn').classList.remove('hidden');
    document.getElementById('export-menu-btn').classList.remove('hidden');
    document.getElementById('sort-select').classList.remove('hidden');
    document.getElementById('view-menu-btn').classList.remove('hidden');
    document.getElementById('reset-btn').classList.remove('hidden');
    document.getElementById('extra-lists').classList.remove('hidden');
    document.getElementById('activity-btn').classList.remove('hidden');
    document.getElementById('select-mode-btn').classList.remove('hidden');
    document.getElementById('mode-select').classList.remove('hidden');
  }
}

function setMode(mode) {
  const isTasks = mode === 'tarefas';
  document.getElementById('board').classList.toggle('hidden', !isTasks);
  document.getElementById('board-summary').classList.toggle('hidden', !isTasks);
  document.getElementById('sprint-progress').classList.toggle('hidden', !isTasks);
  document.getElementById('filter-row').classList.toggle('hidden', !isTasks);
  document.querySelectorAll('#extra-lists .study-panel').forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.listName !== mode);
  });
  document.getElementById('mode-select').value = mode;
}

function populateModeSelect(lists) {
  const select = document.getElementById('mode-select');
  select.querySelectorAll('option:not([value="tarefas"])').forEach(opt => opt.remove());
  lists.forEach(({ name, count }) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name} (${count})`;
    select.appendChild(opt);
  });
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

function openNewTaskModal(prefill) {
  const taskName = document.getElementById('task-name');
  taskName.value = prefill ? prefill.name : '';
  taskName.classList.remove('input--invalid');
  document.getElementById('task-name-count').textContent = `${taskName.value.length} / 80`;
  const taskDesc = document.getElementById('task-desc');
  taskDesc.value = prefill ? prefill.desc : '';
  taskDesc.style.height = 'auto';
  taskDesc.style.height = taskDesc.scrollHeight + 'px';
  document.getElementById('task-desc-count').textContent = `${taskDesc.value.length} / ${TASK_DESC_MAX}`;
  document.getElementById('task-date').value = prefill ? prefill.date : new Date().toISOString().slice(0, 10);
  document.getElementById('task-priority').value = prefill ? prefill.priority : '';
  document.getElementById('modal-feedback').classList.add('hidden');
  document.getElementById('modal-submit').disabled = false;
  document.getElementById('new-task-overlay').classList.remove('hidden');
  taskName.focus();
  taskName.select();
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
  const date = toPtBrDate(isoDate) || new Date().toLocaleDateString('pt-BR');
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

function populateTemplateSelect() {
  const select = document.getElementById('template-select');
  Object.entries(TEMPLATE_CONFIG).forEach(([type, { label }]) => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = label;
    select.appendChild(opt);
  });
}

function populateResponsavelFilter(entries) {
  const select = document.getElementById('responsavel-filter');
  select.querySelectorAll('option:not([value=""])').forEach(opt => opt.remove());
  entries.forEach(({ name, count }) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name} (${count})`;
    select.appendChild(opt);
  });
}
