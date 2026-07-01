# Implements — Ciclo 28

## 1. Sanitizar link contra esquemas perigosos

**Tarefa:** Em `renderCard` (`ui.js`), o valor bruto de `row[5]` só é aceito como `link` se casar com `/^https?:\/\//i` — caso contrário é tratado como string vazia, igual a campo não preenchido.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Debounce no filtro de texto

**Tarefa:** Novo `let debounceTimer` (`app.js`, junto de `refreshTimer`) e `FILTER_DEBOUNCE_MS = 200` (constante nomeada, junto de `SORT_MODES`). O listener de `input` de `#filter-input` agenda `filterCards`/atualização de `filter-count`/`filter-clear-btn`/URL via `setTimeout`, cancelando o anterior a cada tecla.

**Edge case:** Nenhum — `filter-count` e `filter-clear-btn` passaram a atualizar dentro do mesmo `setTimeout` do resultado do filtro, evitando dessincronia.

**Solução:** N/A.

---

## 3. Indicar opções ativas no menu "Visualização"

**Tarefa:** Nova `updateViewMenuLabel()` (`app.js`) conta quantos de `compactMode`/`focusMode`/`columnTimeVisible`/`#auto-refresh.checked` estão ativos e atualiza o texto de `#view-menu-btn`. Chamada ao final dos três toggles existentes (`compact-btn`, `focus-btn`, `column-time-toggle-btn`), num novo listener de `change` em `#auto-refresh`, e uma vez na inicialização após os blocos que restauram esses estados de `localStorage`.

**Edge case:** Nenhum — o novo listener de `#auto-refresh` só atualiza o rótulo; o comportamento de ligar o `setInterval` de auto-refresh continua exclusivamente dentro de `handleSubmit`, sem duplicação.

**Solução:** N/A.

---

## 4. Destacar cards novos

**Tarefa:** `trackColumnTime` (`app.js`) passou a retornar `{ daysByTitle, newTitles }` — `newTitles` é um `Set` dos títulos ausentes do registro anterior de `columnEntryTimes`, calculado no mesmo laço que já lia/escrevia esse registro. `renderColumn`/`renderCard` (`ui.js`) recebem um novo parâmetro `isNew`; quando `true`, um `<span class="card-new-badge">Novo</span>` é inserido antes do título.

**Edge case:** Nenhum — a primeira carga de uma planilha nova marcar todas as tarefas como "novas" é a degradação aceitável já prevista em `FEATURES.md`.

**Solução:** N/A.

---

## 5. Contagem de tarefas vencidas por responsável

**Tarefa:** `renderSummary` (`ui.js`), quando `overdue > 0`, agrupa `document.querySelectorAll('.card-date--overdue')` por `closest('.card').dataset.responsavel` e anexa "(Nome: N, ...)" ordenado alfabeticamente ao texto de vencidas.

**Edge case:** Nenhum — tarefas vencidas sem responsável ficam de fora do detalhamento por nome, entrando só no total, como já previsto.

**Solução:** N/A.

---

## 6. Exportar agenda em lote (.ics)

**Tarefa:** O corpo de um `VEVENT` foi extraído de `buildIcsContent` para `buildIcsEvent(title, desc, dateStr, uid)` (`ui.js`), reaproveitada tanto por `buildIcsContent` (evento único) quanto pela nova `buildIcsCalendar(events)` (um `VCALENDAR` com um `VEVENT` por item, UID único por índice). Nova `downloadIcsCalendar()` (`app.js`) coleta `{ title, desc, date }` de `.card:not(.hidden)` com `date` preenchido e baixa o blob. Novo `<button id="ics-btn">Agenda (.ics)</button>` dentro de `#export-menu-panel`, junto de Baixar .md/JSON/CSV.

**Edge case:** Nenhum — tarefas sem data são filtradas antes de chegar em `buildIcsCalendar`, diferente do `.ics` individual por card que usa `new Date()` como fallback.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.26` para `1.27`. O Passo 0d verificou `invertexto.com/matuto` novamente — mesma sugestão já implementada no ciclo 26 ("fonte para disléxicos"), confirmada e não duplicada.
