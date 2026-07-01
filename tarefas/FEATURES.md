# Features Sugeridas — Sprint Board

Ordenadas por impacto × esforço (maior impacto, menor esforço primeiro).

---

## Fix #002 — Lista de Estudos valida aba antes de exibir

**O que:** Quando a aba "Lista de Estudos" não existe na planilha, a API do Google Sheets retorna os dados da primeira aba sem sinalizar erro. O `studyFetch` deve detectar esse caso e retornar `[]`, exibindo "Nenhum item de estudo" em vez de dados da aba errada.

**Por que:** Falha #002 — usuários sem a aba criada veem dados incorretos no painel de estudos.

**Onde vive:**
- **`config.js`**: mudar `STUDY_RANGE` de `'A2:E'` para `'A1:E'` — incluir a linha de cabeçalho para permitir validação.
- **`app.js`**: em `studyFetch`, após `parseCsv`, verificar ANTES de `filterRows`: se `rows[0]` não existe ou `rows[0][0].trim().toLowerCase() !== 'nome'`, retornar `[]` imediatamente (aba errada ou inexistente). Se válido, chamar `filterRows(rows.slice(1))` — `slice(1)` descarta a linha de cabeçalho; `filterRows` descarta as linhas sem nome nos dados restantes.

**Edge case:** `filterRows` filtra por `row[0]` não-vazio — a linha de cabeçalho ('nome') passaria por ele se não fosse descartada antes. Por isso o slice acontece antes de `filterRows`.

---

## 1. Modo Tarefas / Modo Estudos (SPA)

**O que:** Um botão `#mode-btn` no header alterna a visualização entre dois modos mutuamente exclusivos — **Tarefas** (board Kanban + filter row + summary) e **Estudos** (Lista de Estudos). Apenas um painel é visível por vez. O modo é persistido em `localStorage`.

**Por que:** Hoje o board e a lista de estudos aparecem na mesma tela em sequência. Um toggle SPA mantém a interface limpa e focada, seguindo o padrão do projeto.

**Onde vive:**
- **`ui.js`**: `setMode(mode)` — esconde `#board`, `#board-summary`, `#sprint-progress`, `#filter-row` em modo `'estudo'`; esconde `#study-panel` em modo `'tarefas'`. Atualiza texto (`'Modo Estudos'` / `'Modo Tarefas'`) e classe `header-action-btn--active` de `#mode-btn`. Função análoga a `showState` — não faz fetch, não faz parse, apenas alterna visibilidade.
- **`showState` (ui.js)**: adicionar `#mode-btn` ao bloco de hide inicial e ao bloco de show do estado `'success'`.
- **`app.js`**: após `showState('success')` em `handleSubmit`, chamar `setMode(localStorage.getItem('mode') || 'tarefas')`. Listener de `#mode-btn`: lê se `--active` está presente (= modo estudo), alterna, chama `setMode(newMode)`, persiste com `localStorage.setItem('mode', newMode)`. Adicionar `'mode'` em `STORAGE_KEYS` para que `resetAllSettings` limpe o modo salvo.
- **`index.html`**: `<button id="mode-btn" class="header-action-btn hidden">Modo Estudos</button>` como primeiro item de `.header-actions`.

**Edge case:** `setMode` é chamado APÓS `showState('success')` — ambos executam sincronicamente antes de qualquer repaint, então não há flash de ambos os painéis visíveis simultaneamente. Troca de modo não chama `handleSubmit` — os painéis já estão populados da última carga.

---

## Listas extras dinâmicas via aba de controle "Listas" (1:N)

**O que:** Hoje existe uma única lista extra hardcoded ("Lista de Estudos", via `STUDY_SHEET_NAME`/`STUDY_RANGE` em `config.js` e `studyFetch` inline em `app.js`), alternada por um botão binário `#mode-btn`. Generalizar para N listas extras por planilha, descobertas em runtime: uma nova aba de controle "Listas" (coluna A, cabeçalho `'lista'`) lista os nomes de outras abas da planilha; cada nome vira uma lista extra renderizada com o mesmo schema de 5 colunas que "Lista de Estudos" usa hoje (nome, tópico, prioridade, status, motivo). A "Lista de Estudos" deixa de ser um caso especial no código e passa a ser apenas uma linha de dado possível dentro da aba "Listas".

**Por que:** Pedido do usuário — suportar múltiplas listas auxiliares por planilha (não só estudos), com relação 1 planilha : N listas, sem hardcodar cada nova lista no código.

**Onde vive:**
- **`config.js`**: adicionar `LISTS_SHEET_NAME = 'Listas'`, `LISTS_RANGE = 'A1:A'`, `LISTS_HEADER = 'lista'`, `EXTRA_LIST_RANGE = 'A1:E'` (substitui `STUDY_RANGE`), `EXTRA_LIST_HEADER = 'nome'` (eleva o literal hoje enterrado no `if` de `studyFetch`). Remover `STUDY_SHEET_NAME` e `STUDY_RANGE`.
- **`sheets.js`**: sem mudanças — `buildSheetUrl`, `parseCsv`, `filterRows` já são genéricas o bastante e devem ser reaproveitadas integralmente.
- **`app.js`**: substituir o `studyFetch` inline por duas funções top-level: `fetchListNames(id)` (busca `LISTS_SHEET_NAME`/`LISTS_RANGE`, valida header contra `LISTS_HEADER` — mesma defesa do Fix #002 contra o fallback da API do Google quando a aba não existe — retorna `string[]` de nomes) e `fetchExtraList(id, sheetName)` (busca a aba pelo nome recebido com `EXTRA_LIST_RANGE`, valida header contra `EXTRA_LIST_HEADER`, retorna `string[][]`). `handleSubmit` passa a ter duas fases sequenciais: (1) `Promise.all` das 3 colunas do board + `fetchListNames(id)`; (2) com os nomes descobertos, `Promise.all` de `fetchExtraList(id, name)` por nome. Em seguida chama `renderExtraLists(extraLists)`, `populateModeSelect(listNames)` e `setMode` com fallback seguro se o modo salvo em `localStorage` não existir mais na planilha atual (validar contra `['tarefas', ...listNames]`, senão usar `'tarefas'`). Nenhum listener novo é registrado dentro de `handleSubmit`.
- **`ui.js`**: renomear `renderStudyCard` → `renderListItemCard` (mesma implementação, mesmas classes CSS — sem mudança em `style.css`). Nova `renderExtraLists(lists)` substituindo `renderStudyList`: gera um painel por lista dentro de um container genérico `#extra-lists`, cada painel com `data-list-name`, reaproveitando as classes `.study-panel`/`.study-panel-title`/`.study-body`/`.empty-column` já existentes. Generalizar `setMode(mode)` para aceitar `'tarefas'` ou o nome de qualquer lista dinâmica, mostrando o painel cujo `data-list-name` bate e sincronizando `#mode-select`. Nova `populateModeSelect(listNames)`, análoga a `populateSelect()` (que já popula `#sheet-select` a partir de `SHEETS_MAP`), repopulada a cada `handleSubmit`. `showState` atualizado: trocar referências de `#study-panel`/`#mode-btn` por `#extra-lists`/`#mode-select` nos blocos de hide e no bloco de show do estado `'success'`.
- **`index.html`**: trocar `<button id="mode-btn">` por `<select id="mode-select">` com a opção fixa `"tarefas"` (demais opções inseridas em runtime por `populateModeSelect`). Trocar o painel fixo `#study-panel`/`#body-estudos` por um container vazio `<div id="extra-lists" class="hidden"></div>`, com todo o markup interno gerado por `renderExtraLists`.

**Edge case:** (1) Planilha sem aba "Listas": `fetchListNames` retorna `[]` pela mesma defesa do Fix #002 → sem listas extras, sem erro, `setMode('tarefas')`; é um corte limpo — quem dependia da antiga "Lista de Estudos" hardcoded precisa criar a aba "Listas" com uma linha `"Lista de Estudos"` (migração de dado, não de código). (2) Nome listado em "Listas" cuja aba não existe ou não tem header `'nome'`: `fetchExtraList` retorna `[]` → opção continua aparecendo no select, painel mostra "Nenhum item nesta lista" em vez de dados da aba errada. (3) Nomes duplicados em "Listas": sem dedupe (mesma postura do projeto para `SHEET_NAMES`) — degradação aceitável, não crash. (4) Modo salvo em `localStorage` que não existe na planilha atual: `handleSubmit` valida contra `['tarefas', ...listNames]` e cai para `'tarefas'`. (5) Aba "Listas" existe mas só tem cabeçalho: mesmo tratamento do edge case 1.

---
