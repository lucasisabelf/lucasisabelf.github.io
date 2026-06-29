# Implements — Sprint Board (ciclo 16)

## 1. Coluna de origem e data relativa no modal de detalhes

**Tarefa:** Em `openCardDetail` (ui.js), adicionado campo `#card-detail-column` em `index.html` e preenchido com `Coluna: ${colName}` derivado de `card.closest('.column').querySelector('.column-header').textContent.replace(/ \(\d+\)$/, '')`. Para a data, calculado `delta` via `parsePtBrDate` e `MS_PER_DAY` já existentes, e exibido suffix `· em X dia(s)`, `· hoje` ou `· vencida há X dia(s)` conforme o caso.

**Edge case:** Feature de sticky headers (original #1 do FEATURES.md) descartada por `.column { overflow: hidden }` que bloqueia `position: sticky` em filhos. Substituída pela coluna de origem no modal.

**Solução:** Sticky headers requer remover `overflow: hidden` de `.column` o que quebraria o clipping dos border-radius dos cards. Mantido o overflow; feature substituída por informação contextual no modal de detalhes.

---

## 2. Animação de entrada dos cards (já existia)

**Tarefa:** Feature do FEATURES.md (`@keyframes card-in` + `animation: card-in .15s`) já estava implementada: `.card { animation: fadeIn .18s ease }` e `@keyframes fadeIn` definidos em `style.css`. Nenhuma mudança necessária.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Atalho C para colapsar/expandir todas as colunas

**Tarefa:** No handler `keydown` de `document` em `app.js`, adicionado `c/C` → `querySelectorAll('.column')`, verifica se todas têm `column--collapsed` com `Array.from().every()`, faz toggle inverso em todas e chama `saveCollapseState()`. Em `index.html`, adicionada linha `C → Colapsar/expandir todas as colunas` na tabela de atalhos.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Feedback visual ao baixar .ics

**Tarefa:** No handler `.card-calendar-btn` do board delegation em `app.js`, adicionado `flashButton(calBtn, '✓ Baixando!')` após `downloadIcs(...)`. Consistente com o padrão dos demais botões de ação do card.

**Edge case:** Nenhum

**Solução:** N/A

---
