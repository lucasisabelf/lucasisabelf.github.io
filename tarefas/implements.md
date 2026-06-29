# Implements — Sprint Board

## 1. Feedback visual ao copiar link do board

**Tarefa:** Em `copyBoardLink()` (app.js), `#copy-link-btn` selecionado uma vez antes do `.then()`. Dentro do callback, `textContent` muda para `'✓ Copiado!'` e `setTimeout` de 2s restaura o texto original.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Resumo de tarefas abaixo do board

**Tarefa:** `<div id="board-summary">` adicionado em `index.html` após `#board`. `renderSummary(counts)` em ui.js recebe array `[todo, progress, done]`, calcula total e atualiza o textContent. `showState` gerencia `.hidden`. Em `handleSubmit` (app.js), chamada antes de `renderColumn` com `results.map(r => r.length)`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Ordenação dos cards por prioridade

**Tarefa:** `PRIORITY_ORDER` elevado ao topo de ui.js. `sortByPriority(rows)` pura retorna cópia ordenada. `let sortEnabled = false` em app.js controla o comportamento. `handleSubmit` aplica `sortByPriority` condicionalmente antes de `renderColumn`. Botão `#sort-btn` gerenciado por `showState`; listener em app.js alterna `sortEnabled`, atualiza texto e chama `handleSubmit()`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Exportar board como texto

**Tarefa:** `buildBoardText()` em ui.js itera `.column`, lê headers e cards visíveis (`:not(.hidden)`), monta markdown. `exportBoardText()` em app.js chama `buildBoardText()`, escreve no clipboard e dá feedback temporário no botão (mesmo padrão da feature 1). Botão `#export-btn` gerenciado por `showState`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Collapse de coluna ao clicar no header

**Tarefa:** `toggleColumnCollapse(columnEl)` em ui.js alterna `.column--collapsed`. Em style.css, `.column--collapsed .column-body { display: none }` e `min-height: 0`. `cursor: pointer; user-select: none` adicionados à regra `.column-header` existente (sem duplicar seletor). Listeners registrados uma vez na init de app.js via `querySelectorAll('.column-header')`.

**Edge case:** Nenhum

**Solução:** N/A

---
