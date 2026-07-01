# Implements — Ciclo 22

## 1. Fix #002 — Lista de Estudos valida aba antes de exibir

**Tarefa:** Já implementado em ciclo anterior — absorvido pela generalização da feature 3 (Listas extras 1:N). A validação de header antes de exibir dados hoje vive em `fetchExtraList`/`fetchListNames` (`app.js`), com `EXTRA_LIST_RANGE = 'A1:E'` e `EXTRA_LIST_HEADER = 'nome'` em `config.js`. Nenhuma ação necessária neste ciclo.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Modo Tarefas / Modo Estudos (SPA)

**Tarefa:** Já implementado em ciclo anterior e substituído pela feature 3 (mecanismo binário generalizado para N modos via `#mode-select`). Confirmado: não existe mais `#mode-btn`/`#study-panel` no código. Nenhuma ação necessária neste ciclo.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Listas extras dinâmicas via aba de controle "Listas" (1:N)

**Tarefa:** Já implementado em ciclo anterior. Confirmado no código atual: `config.js` tem `LISTS_SHEET_NAME`, `LISTS_RANGE`, `LISTS_HEADER`, `EXTRA_LIST_RANGE`, `EXTRA_LIST_HEADER` (sem `STUDY_SHEET_NAME`/`STUDY_RANGE`); `app.js` tem `fetchListNames`/`fetchExtraList` top-level chamadas de `handleSubmit`; `ui.js` tem `renderExtraLists`, `populateModeSelect`, `renderListItemCard`, `setMode` generalizado; `index.html` tem `#mode-select` e `#extra-lists`. Nenhuma ação necessária neste ciclo.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Fix #003 — Select de modelo .csv (tarefas vs. lista extra)

**Tarefa:** Já implementado em ciclo anterior. Confirmado no código atual: `config.js` tem `TEMPLATE_CONFIG` e `EXTRA_LIST_TEMPLATE_HEADERS`; `app.js` tem `downloadTemplateCsv` lendo `#template-select`; `ui.js` tem `populateTemplateSelect`. Nenhuma ação necessária neste ciclo.

**Edge case:** Nenhum.

**Solução:** N/A.

---

**Nota do ciclo:** O ciclo anterior (v1.21) implementou todas as 4 entradas listadas em `FEATURES.md`, mas o Passo 4 (limpar `FEATURES.md`) não foi executado corretamente — em vez de sobrescrever o arquivo com o template vazio, uma nova feature foi acrescentada a ele. Como resultado, `FEATURES.md` chegou a este ciclo com conteúdo obsoleto (features já implementadas). Este ciclo não gerou mudanças de código — apenas confirma o estado já implementado e corrige a limpeza de `FEATURES.md` no Passo 4.
