# Implements — Sprint Board

## 1. Botão "Sugerir ao Claude" por card

**Tarefa:** `renderCard` adiciona `data-title/desc/date` ao `.card` e cria `.card-actions` com botão `.card-ask-claude-btn`. Listener de delegação único em `#board` (app.js) intercepta cliques via `closest()`, monta pergunta contextualizada, copia via clipboard e abre `claude.ai`. Feedback via `flashButton` (helper DRY extraído — 4 botões usam o mesmo padrão de feedback temporário).

**Edge case:** FEATURES.md propunha listener direto no botão dentro de `renderCard`. Isso viola SRP — render não registra eventos.

**Solução:** Delegação em `#board` na camada de inicialização de `app.js`. Um único listener cobre todos os cards presentes e futuros.

---

## 2. Botão "Adicionar ao Google Agenda" por card

**Tarefa:** Botão `.card-calendar-btn` adicionado ao `.card-actions` em `renderCard`. Mesmo listener de delegação de `#board` intercepta cliques via segundo `closest()`. Handler chama `buildCalendarUrl(title, desc, dateStr)` (função pura em app.js) que usa `parsePtBrDate` para converter DD/MM/YYYY → YYYYMMDD e monta URL do Google Calendar. Se a data for inválida, URL abre sem parâmetro de data.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Date picker no modal de nova tarefa

**Tarefa:** Campo `<input type="date" id="task-date">` adicionado ao modal em `index.html`. `openNewTaskModal` (ui.js) pré-preenche com `.toISOString().slice(0, 10)`. `submitNewTask` converte o valor ISO para pt-BR via `.split('-').reverse().join('/')`, mantendo compatibilidade com o formato do spreadsheet.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Ordenação de cards por data

**Tarefa:** `parsePtBrDate(str)` extraída ao topo de ui.js (usada também por buildCalendarUrl — 2 usos, mas previsto terceiro em sort). `sortByDate(rows)` pura usa-a para ordenar por prazo ascendente, nulls no final. `let dateSortEnabled` em app.js. Sorts por prioridade e data são mutuamente exclusivos: ativar um desativa e reseta o outro. Persistência em localStorage. Restauração na init.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Contagem de tarefas vencidas no resumo

**Tarefa:** `countOverdue()` em ui.js conta `.card-date--overdue` no DOM. `renderSummary(counts, overdue)` recebe o segundo parâmetro e acrescenta `· N vencidas` somente se `overdue > 0`. Em `handleSubmit`, a chamada `renderSummary` foi movida para depois de `renderColumn` para que os elementos já existam no DOM.

**Edge case:** FEATURES.md propunha chamar `renderSummary` antes de `renderColumn`. Isso produziria contagem zero sempre (DOM ainda não renderizado).

**Solução:** `renderColumn` ocorre primeiro; `renderSummary(counts, countOverdue())` é chamada depois.

---

## 6. Modo compacto de cards

**Tarefa:** `let compactMode` em app.js. Listener de `#compact-btn` alterna a classe `.board--compact` em `#board` diretamente (sem re-fetch), persiste em localStorage e atualiza `.header-action-btn--active` no botão. Em style.css, `.board--compact` oculta `.card-desc`, `.card-date`, `.card-priority` e `.card-actions`. Restauração na init.

**Edge case:** Nenhum

**Solução:** N/A

---

## 7. Botão "← Trocar planilha"

**Tarefa:** `<button id="reset-btn">` dentro de `.header-top-actions` (novo wrapper flex junto do `#theme-toggle`). Listener em app.js chama `showState('idle')`, zera `#sheet-url` e limpa a URL com `history.replaceState(null, '', location.pathname)`. `showState` gerencia visibilidade — visível só em `success`.

**Edge case:** Nenhum

**Solução:** N/A

---
