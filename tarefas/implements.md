# Implements — Sprint Board (ciclo 17)

## 1. Ordenação por título A-Z

**Tarefa:** Adicionado `sortByTitle(rows)` em `ui.js` usando `localeCompare('pt-BR')`. Em `app.js`: novo flag `titleSortEnabled`, adicionado `'titleSortEnabled'` em `STORAGE_KEYS`, aplicado em `handleSubmit` no bloco de sort, listener `#title-sort-btn` desativa os outros sorts ao ser ativado (mutuamente exclusivo, mesmo padrão dos demais), restauração no bloco de init. Em `index.html`: `#title-sort-btn` nas `.header-actions`. Em `showState` (ui.js): botão incluído no bloco de hide/show igual aos outros sorts.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Atalho S para ordenar por prioridade

**Tarefa:** No handler `keydown` de `document` em `app.js`, adicionado `if (e.key === 's' || e.key === 'S') document.getElementById('sort-btn').click()`. Em `index.html`, adicionada linha `S → Ordenar por prioridade (toggle)` na tabela de atalhos.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Indicador visual de auto-refresh ativo

**Tarefa:** Em `handleSubmit` (app.js), lida `autoActive = checkbox.checked` e usado `.classList.toggle('header-action-btn--active', autoActive)` no `#refresh-btn` antes de configurar o `setInterval`. O botão fica destacado quando o auto-refresh está ativo.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Esc limpa filtro de qualquer lugar no body

**Tarefa:** No handler `keydown` de `document` em `app.js`, antes do bloco `!boardVisible || inInput`, adicionado: se `boardVisible && !inInput && e.key === 'Escape'` e `filter-input` tem valor → limpa filtro, remove classes hidden, reset URL param. Complementa o Esc-dentro-do-input que já existia.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Ctrl+Shift+Header exporta coluna como CSV

**Tarefa:** No listener do `.column-header` em `app.js`, adicionada verificação `e.shiftKey && e.ctrlKey` ANTES da verificação `e.shiftKey` simples (precedência correta). Ao detectar Ctrl+Shift, constrói CSV com cabeçalho e usa `csvEscape` já existente. Em `index.html`, adicionada linha `Ctrl+Shift+Header → Copiar coluna como CSV`.

**Edge case:** Nenhum

**Solução:** N/A

---

## Falha #001 — segunda tentativa (abordagem combinada)

**Tarefa:** Adicionado `buildCalendarUrl(title, desc, dateStr)` em `ui.js` (junto de `buildIcsContent`/`parsePtBrDate`) usando o endpoint `action=TEMPLATE` do Google Calendar. No handler `.card-calendar-btn`, adicionado `window.open(buildCalendarUrl(...))` após `downloadIcs(...)`. Botão agora aciona as duas ações simultaneamente: download `.ics` (para apps de calendário nativos) + abertura Google Calendar web (fallback para Android/web).

**Edge case:** Nenhum

**Solução:** N/A

---
