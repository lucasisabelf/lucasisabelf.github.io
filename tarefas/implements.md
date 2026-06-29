# Implements — Sprint Board

## 1. Header fixo (sticky) na rolagem

**Tarefa:** Adicionados `position: sticky; top: 0; z-index: 10` à regra `.app-header` existente em `style.css`. O `background: var(--surface)` já presente garante que o conteúdo do board fique oculto atrás do header ao rolar. Nenhuma alteração em HTML ou JS.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Contagem de cards com prazo próximo no resumo

**Tarefa:** Adicionada `countWarning()` em `ui.js` logo após `countOverdue()` — mesmo padrão, seleciona `.card-date--warning`. Assinatura de `renderSummary` atualizada para `(counts, overdue, warning)`; o texto inclui `· N com prazo próximo` quando `warning > 0`, posicionado após o bloco de vencidas. Em `app.js`, a chamada em `handleSubmit` atualizada para `renderSummary(results.map(r => r.length), countOverdue(), countWarning())`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Animação de entrada dos cards ao carregar

**Tarefa:** Adicionada `@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }` em `style.css`. Adicionado `animation: fadeIn .18s ease` à regra `.card` existente. Nenhuma alteração em HTML ou JS.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Tooltip com data por extenso nos cards

**Tarefa:** Em `renderCard` (ui.js), após a lógica de `card-date--overdue`/`card-date--warning`, adicionada uma linha: `if (parsed) dt.title = parsed.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`. Reutiliza o `parsed` já computado por `parsePtBrDate`. Nenhuma alteração em HTML, CSS ou app.js.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Auto-resize do textarea de descrição no modal

**Tarefa:** Em `app.js`, registrado listener em `#task-desc` input que faz `this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'` para auto-crescimento. Em `openNewTaskModal` (ui.js), adicionado reset da altura (`taskDesc.style.height = 'auto'`) após limpar o valor, para que a altura volte ao padrão ao reabrir o modal. Em `style.css`, `resize: vertical` substituído por `resize: none` na regra `.modal-field` — o resize manual torna-se redundante com o auto-resize ativo.

**Edge case:** Nenhum

**Solução:** N/A

---
