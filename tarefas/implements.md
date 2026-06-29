# Implements — Sprint Board

## 1. Corrigir timezone em `parsePtBrDate`

**Tarefa:** Em `parsePtBrDate` (ui.js), substituído `new Date('YYYY-MM-DD')` por `new Date(parseInt(year), parseInt(month) - 1, parseInt(day))`. O construtor de 3 argumentos interpreta os valores como hora local, eliminando o deslocamento de UTC que fazia datas DD/MM/YYYY aparecerem como "dia anterior" em fusos UTC-1 a UTC-12. Corrige silenciosamente overdue, warning, sort-by-date e o novo badge "Hoje".

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Badge "Hoje" para cards com prazo no dia atual

**Tarefa:** Em `renderCard` (ui.js), adicionado bloco `else if` após o check de `card-date--overdue` que aplica `card-date--today` quando `parsed.getTime() === today.getTime()` — possível após a correção de timezone da feature 1. O bloco `card-date--warning` foi ajustado de `parsed >= today` para `parsed > today` para excluir o dia atual. Em `style.css`, declaradas variáveis `--today-bg` e `--today-color` em `:root` (#f0fff4 / #276749) e `[data-theme="dark"]` (#1a2d1e / #68d391), e adicionada regra `.card-date--today` com essas variáveis.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Contador de caracteres na descrição do modal

**Tarefa:** Constante `TASK_DESC_MAX = 300` declarada no topo de `ui.js` junto de `DAYS_UNTIL_WARNING`. Em `index.html`, adicionados `maxlength="300"` ao `#task-desc` e `<small id="task-desc-count" class="char-count">0 / 300</small>` logo após o textarea. Em `openNewTaskModal` (ui.js), reseto de `task-desc-count` via `\`0 / ${TASK_DESC_MAX}\``. No listener `input` existente em `#task-desc` (app.js), adicionada atualização de `task-desc-count` com `\`${this.value.length} / ${TASK_DESC_MAX}\`` — sem criar segundo listener.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Download do board como JSON estruturado

**Tarefa:** Em `app.js`, adicionadas `buildBoardJson()` (itera `.column`, lê `.column-header` e `.card[data-*]`, retorna objeto com arrays por coluna) e `downloadBoardJson()` (Blob JSON, `<a download="sprint-board.json">`, pattern idêntico ao `downloadBoardText`). Em `index.html`, adicionado `<button id="json-btn" class="header-action-btn hidden">JSON</button>` após `#download-btn`. Em `showState` (ui.js), `#json-btn` adicionado aos conjuntos de hide-all e show-on-success. Listener registrado na seção de inicialização de `app.js`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Atalhos adicionais na tabela do overlay de ajuda

**Tarefa:** Em `index.html`, adicionadas três linhas ao `<tbody>` da `.shortcuts-table`: "Esc (no filtro)" → limpar filtro, "Ctrl+Enter" → submeter modal, "Badge de prioridade" → filtrar por prioridade. Nenhuma alteração em JS ou CSS.

**Edge case:** Nenhum

**Solução:** N/A

---
