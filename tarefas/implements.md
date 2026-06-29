# Implements — Sprint Board

## 1. Scroll independente por coluna

**Tarefa:** Adicionado `max-height: 70vh; overflow-y: auto` ao `.column-body` existente em `style.css`. Adicionada scrollbar estilizada via `::-webkit-scrollbar` e `::-webkit-scrollbar-thumb`. Nenhuma alteração em HTML ou JS.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Barra de progresso do sprint

**Tarefa:** Adicionado `<div id="sprint-progress">` com `<div id="sprint-progress-bar">` no `index.html` após `#board-summary`. Em `ui.js`, `renderSummary` calcula `pct = Math.round((counts[2] / total) * 100)` e aplica ao `style.width` do bar. `showState` gerencia visibilidade de `#sprint-progress` junto de `#board-summary`. CSS define a barra com `transition: width .4s ease` para animação suave.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Destaque de prazo próximo nos cards

**Tarefa:** Adicionada constante `DAYS_UNTIL_WARNING = 3` ao topo de `ui.js` junto de `PRIORITY_CLASS` e `PRIORITY_ORDER`. Em `renderCard`, a checagem de data foi refatorada para usar `parsePtBrDate(date)` em vez de `new Date(date)` (o formato real dos dados é DD/MM/YYYY). Cards não vencidos com prazo dentro de `DAYS_UNTIL_WARNING` dias recebem `.card-date--warning`. CSS adiciona variáveis `--warning-bg`/`--warning-color` em `:root` e `[data-theme="dark"]` e a regra `.card-date--warning`.

**Edge case:** FEATURES.md propunha usar a variável `parsed` já existente (computada com `new Date(date)`). Esse parser falha para datas no formato DD/MM/YYYY — o formato real dos dados da planilha, evidenciado pela existência de `parsePtBrDate` no projeto. Usar `new Date('28/06/2026')` retorna `Invalid Date` na maioria dos browsers.

**Solução:** O bloco de data em `renderCard` foi alterado para usar `parsePtBrDate(date)`, corrigindo simultaneamente a detecção de vencimento (que também estava quebrada) e implementando o destaque de aviso corretamente.

---

## 4. Histórico de planilhas recentes

**Tarefa:** Em `app.js`, adicionadas `saveRecentSheet(url)` — lê o array de `localStorage.getItem('recentSheets')`, faz prepend da URL, remove duplicatas via `filter`, limita a 5 e salva — e `initRecentSheets()` — lê o array e, se não vazio, cria `<optgroup label="Recentes">` no `#sheet-select` com uma `<option>` por URL (50 chars + `…`). `saveRecentSheet(input)` é chamada em `handleSubmit` após `localStorage.setItem('lastSheet')`. `initRecentSheets()` é chamada na inicialização após `populateSelect()`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Overlay de atalhos de teclado

**Tarefa:** Adicionado `<button id="help-btn" class="theme-toggle">?</button>` no `.header-top-actions` do `index.html`. Adicionado `#help-overlay` com tabela de 6 atalhos (R, F, N, ?, Esc, Header) e botão `#help-close-btn`. Em `ui.js`, adicionada `toggleHelp()` que alterna `.hidden` no overlay. Em `app.js`, registrados listeners para `#help-btn`, `#help-close-btn` e clique no fundo do overlay. No listener `keydown` existente: `?` chama `toggleHelp()` (antes da guarda de `inInput`); `Escape` fecha o overlay além do modal. CSS adiciona `.shortcuts-table` com `td:first-child` destacado.

**Edge case:** Nenhum

**Solução:** N/A

---
