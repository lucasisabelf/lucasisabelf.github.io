# Implements — Sprint Board

## 1. Contador de cards por coluna

**Tarefa:** Em `renderColumn` (ui.js), após limpar o body, atualizar o texto do `.column-header` da coluna com o sufixo ` (N)` se houver cards, ou sem sufixo se vazio. Usa regex para remover contagem anterior antes de inserir a nova.

**Edge case:** FEATURES.md dizia "Sem alteração em index.html ou style.css" — cumpriu. A abordagem de strip por regex (`/ \(\d+\)$/`) evita precisar de `data-label` no HTML.

**Solução:** N/A

---

## 2. Persistência da última URL carregada

**Tarefa:** Em `handleSubmit` (app.js), após `showState('success')`, `localStorage.setItem('lastSheet', input)`. Na inicialização, URL param (`?sheet=`) tem prioridade sobre `localStorage`; se nenhum dos dois existir, nada é carregado.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Board compartilhável via URL

**Tarefa:** Na inicialização de app.js, lê `new URLSearchParams(location.search).get('sheet')`. Se presente, preenche o input e chama `handleSubmit()`. Função `copyBoardLink()` monta a URL com `?sheet=encodeURIComponent(input)` e copia via `navigator.clipboard.writeText`. Botão `#copy-link-btn` adicionado em `index.html` dentro de `.header-actions`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Destaque visual de datas vencidas

**Tarefa:** Em `renderCard` (ui.js), após criar o elemento `dt`, compara a data parseada com hoje (meia-noite). Se `parsed < today`, adiciona classe `card-date--overdue`. Em style.css, `.card-date--overdue` usa variáveis CSS para suporte a dark mode (`--overdue-bg`, `--overdue-color`).

**Edge case:** FEATURES.md definia cores hardcoded `#fff5f5` e `#c53030`. Como o Modo Escuro (feature 10) usa variáveis CSS, hardcodar aqui quebraria o dark mode.

**Solução:** As cores de overdue foram migradas para variáveis (`--overdue-bg`, `--overdue-color`) com variantes no bloco `[data-theme="dark"]`.

---

## 5. Botão de atualizar board

**Tarefa:** Botão `#refresh-btn` adicionado em `index.html` dentro de `.header-actions`. Sua visibilidade é gerenciada por `showState` em ui.js (aparece só em `success`). Listener em app.js chama `handleSubmit()`. Estilizado com `.header-action-btn` (link-like, sem borda).

**Edge case:** FEATURES.md sugeria adicionar/remover o listener em cada chamada de `handleSubmit`. Isso cria múltiplos listeners acumulados.

**Solução:** O listener é registrado uma única vez na inicialização, junto dos demais listeners de app.js. A visibilidade é delegada a `showState`.

---

## 6. Auto-refresh configurável

**Tarefa:** `let refreshTimer` em app.js. `clearInterval(refreshTimer)` no início de `handleSubmit`. Após success, se `#auto-refresh` está marcado, inicia `setInterval(handleSubmit, intervalMs)`. Controles de UI (`#auto-refresh-controls`) gerenciados por `showState` — visíveis só em `success`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 7. Filtro de cards por texto

**Tarefa:** Input `#filter-input` adicionado em `index.html` dentro de `.app-header`, antes de `.header-actions`. Função `filterCards(query)` em ui.js itera `.card` e alterna `.hidden` por correspondência case-insensitive em título ou descrição. Listener `input` em app.js. `showState` limpa o filtro (zera o valor e chama `filterCards('')`) ao sair de qualquer estado.

**Edge case:** Nenhum

**Solução:** N/A

---

## 8. Indicador de prioridade nos cards

**Tarefa:** `buildSheetUrl` em sheets.js alterado de `A3:C` para `A3:D`. Em `renderCard` (ui.js), lê `row[3]` como prioridade. Mapa `PRIORITY_CLASS` no topo de ui.js mapeia texto para classe CSS. Badge `<span class="card-priority priority--*">` adicionado ao card. Três variantes de prioridade em style.css com variáveis para dark mode.

**Edge case:** FEATURES.md dizia para criar o mapa de prioridade dentro de `renderCard`. Constante dentro de função é recriada a cada chamada.

**Solução:** `PRIORITY_CLASS` elevado para constante no topo de ui.js, seguindo a convenção de "constantes nomeadas no topo do arquivo".

---

## 9. Título da aba refletindo o estado do board

**Tarefa:** Em `handleSubmit` (app.js), após `Promise.all`, atribui `document.title` com a contagem de `results[1].length` (In Progress) se maior que zero, ou `'Sprint Board'` se vazio.

**Edge case:** Nenhum

**Solução:** N/A

---

## 10. Modo escuro

**Tarefa:** Todas as cores hardcoded migradas para variáveis CSS em `:root`. Bloco `[data-theme="dark"]` define os valores alternativos. Botão `#theme-toggle` em `index.html` dentro de `.header-top`. Função `initTheme()` em app.js lê `localStorage` e `prefers-color-scheme`, define o tema inicial, atualiza o ícone do botão (☀/☾) e registra o listener de toggle.

**Edge case:** FEATURES.md sugeria criar `theme.js`. Um arquivo só para gestão de tema seria uma abstração prematura — a função `initTheme()` em app.js resolve com uma única responsabilidade sem justificar novo arquivo.

**Solução:** `initTheme()` adicionada em app.js como função de setup, chamada uma vez na inicialização, ao lado de `populateSelect()`.

---

## 11. Pop-up de nova tarefa

**Tarefa:** Modal completo em `index.html` com overlay, campos Nome e Descrição, área de feedback e ações. Header reestruturado com `.header-top` (h1 + theme toggle) e `.header-actions` (links e botões de ação). Três funções em ui.js: `openNewTaskModal`, `closeNewTaskModal`, `submitNewTask`. `showState` gerencia visibilidade de `#new-task-btn`. Seis listeners em app.js (botão, cancelar, submit, click no overlay, Enter no input, Escape global).

**Edge case:** `submitNewTask` em ui.js acessa `document.getElementById('sheet-url').value` para abrir a planilha — referência a um elemento fora do escopo do modal. FEATURES.md prescreve esse comportamento explicitamente.

**Solução:** Mantido conforme prescrito. A alternativa (passar a URL como argumento via app.js) criaria acoplamento inverso mais complexo. O comportamento está isolado dentro de `submitNewTask` e não vaza para outras funções.

---
