# Implements — Ciclo 30

## 1. Parsing seguro de localStorage

**Tarefa:** Nova `safeJsonParse(json, fallback)` (`app.js`, topo do arquivo) — `try/catch` retornando `fallback` em caso de JSON corrompido. Os 5 pontos que faziam `JSON.parse` direto (`trackColumnTime`, `logActivity`, `initCollapseState`, `saveRecentSheet`, `initRecentSheets`) passaram a usar `safeJsonParse(localStorage.getItem(chave), fallback)`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Escapar caracteres especiais no .ics

**Tarefa:** Nova `escapeIcsText(text)` (`ui.js`, junto de `buildIcsEvent`) aplicando os escapes exigidos pelo RFC 5545 (`\`, `;`, `,`, quebra de linha, nessa ordem). `buildIcsEvent` passou a aplicar `escapeIcsText` em `title` e `desc` antes de montar `SUMMARY`/`DESCRIPTION`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Tempo médio em andamento no resumo

**Tarefa:** `renderCard` (`ui.js`) grava `card.dataset.daysInColumn` sempre que `daysInColumn` é definido. `renderSummary` calcula a média desse valor entre os cards de `#body-progress` e anexa "· Tempo médio em andamento: N dias" ao texto quando há pelo menos 1 card com valor.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Contagem de atividades não vistas

**Tarefa:** `logActivity` (`app.js`) passou a manter também um contador monotônico `activityTotalCount` em `localStorage` (incrementado por `transitions.length` a cada carregamento, nunca truncado — diferente do `activityLog`, que só guarda as 20 mais recentes), retornando `{ log, totalCount }`. Nova `updateActivityBadge(unseenCount)` (`ui.js`) atualiza o texto de `#activity-btn`. O listener de clique de `#activity-btn` (`app.js`), ao detectar que o painel estava fechado e vai abrir, salva `activityTotalCount` atual como `activityLastSeenCount` e zera o badge.

**Edge case:** `FEATURES.md` descrevia comparar `activityLog.length` (visto) contra o total — mas como o log é truncado em `ACTIVITY_LOG_LIMIT` (20), sua contagem para de crescer após o limite, tornando a comparação de "não vistos" incorreta assim que o log enche. Um contador monotônico separado (`activityTotalCount`, nunca truncado) era necessário para a contagem de não vistos funcionar corretamente mesmo com o log cheio.

**Solução:** `logActivity` passou a manter `activityTotalCount` (incrementado, nunca truncado) além de `activityLog` (truncado); a contagem de não vistos compara `activityTotalCount` contra `activityLastSeenCount`, não o tamanho do log.

---

## 5. Selecionar texto do nome ao abrir modal

**Tarefa:** `openNewTaskModal` (`ui.js`) chama `taskName.select()` logo após `taskName.focus()`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 6. Indicador de data inválida

**Tarefa:** Em `renderCard` (`ui.js`), quando `date` está preenchido mas `parsePtBrDate(date)` retorna `null`, o elemento `.card-date` já existente ganha a classe `card-date--invalid` e um `title` explicativo. `.card-date--invalid { color: var(--error-color); text-decoration: underline dotted; }` em `style.css`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.28` para `1.29`. O Passo 0d verificou `invertexto.com/matuto` novamente — mesma sugestão do WhatsApp já implementada no ciclo anterior, confirmada e não duplicada.
