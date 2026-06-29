# Implements — Sprint Board

## 1. Persistência do estado collapsed das colunas

**Tarefa:** Em `app.js`, adicionadas `saveCollapseState()` — itera `.column`, salva `{ col.id: isCollapsed }` em `localStorage.setItem('collapseState', ...)` — e `initCollapseState()` — lê o objeto e aplica `col.classList.toggle('column--collapsed', !!state[col.id])` a cada coluna. O listener de `column-header` foi atualizado para chamar `saveCollapseState()` após `toggleColumnCollapse`. `initCollapseState()` é chamada uma vez na seção de inicialização.

**Edge case:** FEATURES.md propunha chamar `initCollapseState()` em `handleSubmit` após `showState('success')`. Isso é desnecessário porque `renderColumn` só reconstrói o conteúdo de `.column-body` (via `innerHTML = ''`), nunca o elemento `.column` externo. A classe `.column--collapsed` no `.column` sobrevive a cada re-render. Chamar `initCollapseState()` a cada refresh sobrescreveria a sessão sem necessidade.

**Solução:** `initCollapseState()` é chamada uma única vez na inicialização de `app.js`. O estado de sessão é preservado entre refreshes naturalmente, sem re-aplicação.

---

## 2. Borda lateral colorida nos cards por prioridade

**Tarefa:** Em `style.css`, adicionadas três regras com seletor de atributo após `.card:hover`:
- `.card[data-priority="Alta"] { border-left: 3px solid var(--priority-high-color); }`
- `.card[data-priority="Média"] { border-left: 3px solid var(--priority-mid-color); }`
- `.card[data-priority="Baixa"] { border-left: 3px solid var(--empty-col); }`

O `data-priority` já é setado em `renderCard`. Nenhuma alteração em HTML ou JS.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Validação visual no modal de nova tarefa

**Tarefa:** Em `submitNewTask` (ui.js), substituído `if (!name) return` por bloco que adiciona `.input--invalid` ao `#task-name` e devolve o foco. Em `openNewTaskModal` (ui.js), adicionado `taskName.classList.remove('input--invalid')` e reset do contador `task-name-count` para `'0 / 80'`. Em `app.js`, o listener `input` em `#task-name` (registrado na seção de inicialização) combina remoção da classe inválida e atualização do contador — dois comportamentos do mesmo evento, sem duplicação. Em `style.css`, adicionada `.input--invalid { border-color: var(--error-color) !important; }`.

**Edge case:** FEATURES.md descrevia dois listeners separados em `#task-name input` — um para remover `.input--invalid`, outro para atualizar o contador. Dois listeners para o mesmo evento no mesmo elemento acumulam overhead e fragmentam comportamentos interdependentes.

**Solução:** Combinados em um único listener `input` que executa ambas as operações em sequência. Um único `getElementById('task-name-count')` no corpo do listener elimina busca duplicada.

---

## 4. Contador de caracteres no campo nome da tarefa

**Tarefa:** Em `index.html`, adicionado `<small id="task-name-count" class="char-count">0 / 80</small>` dentro de `.modal-field` após o `<input id="task-name">`. O listener `input` de `#task-name` em `app.js` (compartilhado com feature 3) atualiza o textContent. Em `openNewTaskModal` (ui.js), o reset de `task-name-count` para `'0 / 80'` é feito junto com os demais resets do modal. Em `style.css`, adicionada `.char-count` com `display: block; text-align: right`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Estilos de impressão

**Tarefa:** Em `style.css`, adicionado bloco `@media print` ao final que oculta: `.hint`, `.input-row`, `.filter-row`, `.filter-count`, `.header-actions`, `.auto-refresh-controls`, `.header-top-actions`, `.board-summary`, `.sprint-progress`, `.state-panel`, `.modal-overlay`. Sobrescreve `.app-header` para `position: static`, `.board` para `grid-template-columns: repeat(3, 1fr)`, `.column-body` para `max-height: none; overflow: visible` e `.card-actions` para `display: none`. Nenhuma alteração em HTML ou JS.

**Edge case:** Nenhum

**Solução:** N/A

---
