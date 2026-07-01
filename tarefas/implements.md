# Implements — Ciclo 21

## 0. Fix #003 — Select de modelo .csv (tarefas vs. lista extra)

**Tarefa:** `#template-btn` baixava sempre o CSV de cabeçalhos de tarefas. Adicionado `#template-select` ao lado do botão, populado em runtime por `populateTemplateSelect()` (nova, em `ui.js`, análoga a `populateSelect()`) a partir de `TEMPLATE_CONFIG` (novo, em `config.js`), que mapeia cada tipo a `{ label, headers, filename }` — reaproveitando `TEMPLATE_HEADERS` e a nova `EXTRA_LIST_TEMPLATE_HEADERS` (schema de 5 colunas usado por qualquer lista extra dinâmica, generalizado na feature 3 deste mesmo ciclo). `buildTemplateCsv` passou a receber `headers` por parâmetro; `downloadTemplateCsv` lê o `<select>` e resolve `{ headers, filename }` via `TEMPLATE_CONFIG[type]`.

**Edge case:** A revisão (`/review`) apontou que hardcodar as `<option>` de `#template-select` em `index.html` duplicava as mesmas chaves já declaradas em `TEMPLATE_CONFIG` — se um tipo fosse renomeado só de um lado, `TEMPLATE_CONFIG[type]` viraria `undefined` e `downloadTemplateCsv` quebraria na desestruturação.

**Solução:** Elevado um campo `label` em cada entrada de `TEMPLATE_CONFIG` e adicionada `populateTemplateSelect()`, que gera as `<option>` a partir de `Object.entries(TEMPLATE_CONFIG)` — mesmo padrão de `populateSelect()` (que já popula `#sheet-select` a partir de `SHEETS_MAP`). `index.html` ficou só com `<select id="template-select"></select>` vazio; `TEMPLATE_CONFIG` em `config.js` passou a ser a única fonte de verdade para tipos, labels, headers e nomes de arquivo.

---

## 1. Fix #002 — Lista de Estudos valida aba antes de exibir

**Tarefa:** Já implementado em ciclo anterior (`STUDY_RANGE = 'A1:E'` em `config.js`, validação de header `'nome'` em `studyFetch`). Nenhuma ação necessária neste ciclo.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Modo Tarefas / Modo Estudos (SPA)

**Tarefa:** Já implementado em ciclo anterior (`setMode`, `#mode-btn`, `#study-panel`). Substituído neste ciclo pela feature 3 abaixo, que generaliza o mecanismo binário para N modos — ver detalhes na feature 3.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Listas extras dinâmicas via aba de controle "Listas" (1:N)

**Tarefa:** Generalizado o mecanismo de lista extra única ("Lista de Estudos" hardcoded) para N listas extras descobertas em runtime. `config.js` ganhou `LISTS_SHEET_NAME`, `LISTS_RANGE`, `LISTS_HEADER`, `EXTRA_LIST_RANGE`, `EXTRA_LIST_HEADER`, substituindo `STUDY_SHEET_NAME`/`STUDY_RANGE`. `app.js` ganhou `fetchListNames(id)` e `fetchExtraList(id, sheetName)` como funções top-level (substituindo o `studyFetch` que antes era uma função aninhada dentro de `handleSubmit`), com a mesma validação defensiva de header do Fix #002. `handleSubmit` passou a operar em duas fases: descobre os nomes das listas via `fetchListNames`, depois busca cada uma via `fetchExtraList`. `ui.js` ganhou `renderExtraLists(lists)` (substitui `renderStudyList`, gera N painéis dinâmicos com `data-list-name` dentro do container genérico `#extra-lists`) e `populateModeSelect(listNames)` (análoga a `populateSelect()`, repopula `#mode-select` a cada carga). `renderStudyCard` foi renomeada para `renderListItemCard` (mesma implementação, mesmas classes CSS — sem mudança em `style.css`). `setMode(mode)` deixou de ser um toggle binário e passou a aceitar `'tarefas'` ou o nome de qualquer lista dinâmica, alternando visibilidade via `data-list-name` e sincronizando o `<select>`. `index.html` trocou `#mode-btn` por `<select id="mode-select">` e o painel fixo `#study-panel`/`#body-estudos` por um container vazio `#extra-lists`, todo populado via JS.

**Edge case:** A descrição em `FEATURES.md` propunha o `setMode` generalizado convivendo com a seção "Padrão SPA" de `.claude/commands/dev.md`, que documenta explicitamente um esquema binário de exatamente dois modos ("Tarefas" e "Estudo"). Isso não é uma violação de SRP/DRY — as regras subjacentes do padrão (um modo visível por vez, função dedicada `setMode`, sem estado global de modo, persistência via `localStorage`) se generalizam sem alteração para N modos; a redação de `dev.md` só descrevia o caso binário como era a única instância existente até este ciclo.

**Solução:** Implementado exatamente como descrito em `FEATURES.md` — nenhuma adaptação necessária, pois nenhum princípio SRP/DRY foi violado. `renderExtraLists` insere diretamente no DOM (não retorna elemento), o que segue o mesmo precedente já estabelecido por `renderColumn` (populador de container) e pela antiga `renderStudyList` — não é uma nova exceção à regra do checklist de `dev.md`.

---
