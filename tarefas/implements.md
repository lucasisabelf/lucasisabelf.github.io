# Implements — Sprint Board (ciclo 18)

## 1. Aba "Lista de Estudos"

**Tarefa:** Adicionadas constantes `STUDY_SHEET_NAME = 'Lista de Estudos'` e `STUDY_RANGE = 'A2:E'` em `config.js`. `buildSheetUrl` em `sheets.js` recebeu parâmetro `range = 'A3:D'` (default preserva o comportamento do board). Em `ui.js`: constante `STUDY_COLUMNS` no topo, funções `renderStudyCard(row)` e `renderStudyList(rows)` para o schema de 5 colunas, `showState` atualizado para hide/show `#study-panel`. Em `app.js`: `handleSubmit` expandido com `studyFetch()` incluído no mesmo `Promise.all` via `allResults = await Promise.all([...fetches, studyFetch()])`, resultados separados por slice antes do render do board. `renderStudyList(studyRows)` chamado antes de `showState('success')`. Em `index.html`: `#study-panel` com `#body-estudos` adicionado após `#sprint-progress`.

**Edge case:** `studyFetch` tem try/catch próprio e retorna `[]` em qualquer erro (aba inexistente, HTML, falha de rede) sem propagar exceção ao `Promise.all` externo. O board nunca quebra por ausência da Lista de Estudos. `filterRows` já descarta linhas sem `nome` (filtra por `row[0]`), sem código extra.

**Solução:** N/A

---

## 2. Baixar planilha-modelo com cabeçalhos

**Tarefa:** Adicionada constante `TEMPLATE_HEADERS = ['Título', 'Descrição', 'Data', 'Prioridade']` em `config.js`. Em `app.js`: `buildTemplateCsv()` retorna a string CSV com BOM reaproveitando `csvEscape`; `downloadTemplateCsv()` segue o padrão de `downloadBoardCsv` (Blob + BOM `﻿` + `URL.createObjectURL` + `revokeObjectURL`, filename `sprint-board-modelo.csv`). Listener `#template-btn` registrado na seção de inicialização de `app.js`. Botão `#template-btn` adicionado em `index.html` ao lado de `#csv-btn`. `showState` atualizado para hide/show `#template-btn`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Animação "forca" de atraso (gamificação estilo Duolingo)

**Tarefa:** Adicionadas constante `OVERDUE_STAGES` (array decrescente por `minDays`) e função pura `overdueStage(daysLate)` no topo de `ui.js`. Em `renderCard`, dentro do bloco `if (parsed)` onde `delta` já é calculado, adicionado `if (delta < 0) card.dataset.overdueStage = overdueStage(Math.abs(delta))` — reutiliza `parsePtBrDate` e o `delta` já existentes, sem nenhuma instanciação extra de `Date`. Em `style.css`: variável `--forca-stroke` adicionada em `:root` (`#c53030`) e `[data-theme="dark"]` (`#fc8181`); `.card` recebeu `position: relative`; 4 estágios progressivos via `::before` com `box-shadow` pixel-art (stage 1: quadro; stage 2: + corda; stage 3: + cabeça; stage 4: + corpo/braços + animação `forca-pulse`). Regra `#col-done .card::before { display: none }` zera a forca em tarefas concluídas. `prefers-reduced-motion` desativa a animação do stage 4.

**Edge case:** Tarefas na coluna Done suprimidas via CSS (`#col-done .card::before { display: none }`) — o JS ainda seta o atributo para evitar condicional em `renderCard` acoplado ao nome da coluna, mas o CSS garante que o desenho não apareça. Tarefas sem data nunca entram no bloco `if (date)`, logo nunca recebem `data-overdue-stage`.

**Solução:** A supressão do stage na coluna Done é feita via CSS em vez de condicional JS em `renderCard`, preservando SRP: `renderCard` não precisa saber em qual coluna o card está sendo inserido.

---
