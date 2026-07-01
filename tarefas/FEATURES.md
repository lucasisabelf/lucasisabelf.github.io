# Features Sugeridas — Sprint Board

Ordenadas por impacto × esforço (maior impacto, menor esforço primeiro).

---

## 1. Aba "Lista de Estudos" (nova fonte de dados)

**O que:** Carregar e exibir uma nova aba do Google Sheets chamada `Lista de Estudos`, separada do board de tarefas. Os dados começam na **linha 2** (linha 1 é cabeçalho) e têm 5 colunas nesta ordem: `nome`, `topico`, `prioridade`, `status`, `motivo`. Linhas sem `nome` são ignoradas.

**Por que:** Permite acompanhar itens de estudo com um schema próprio, sem forçá-los no formato de 4 colunas do board (título/desc/data/prioridade).

**Onde vive:**
- **`config.js`**: nova constante `STUDY_SHEET_NAME = 'Lista de Estudos'` (junto de `SHEET_NAMES`). Nova constante `STUDY_RANGE = 'A2:E'` — o board usa `A3:D`, a Lista de Estudos começa uma linha antes e tem uma coluna a mais, então o range precisa ser parametrizável.
- **`sheets.js`**: `buildSheetUrl(id, sheetName)` hoje fixa `range=A3:D` no template. A feature deve tornar o range um parâmetro (`buildSheetUrl(id, sheetName, range)`) com o default `'A3:D'` para não quebrar as chamadas do board. A chamada da Lista de Estudos passa `STUDY_RANGE`.
- **`ui.js`**: constante `STUDY_COLUMNS = ['nome', 'topico', 'prioridade', 'status', 'motivo']` no topo (documenta o mapeamento índice→campo, análogo a como `renderCard` mapeia `row[0..3]`). Nova função `renderStudyCard(row)` — mesma responsabilidade de `renderCard`, mas para o schema de estudo. Reaproveita `PRIORITY_CLASS` para o badge de prioridade. Nova função `renderStudyList(rows)` análoga a `renderColumn`.
- **`index.html`**: nova seção/painel `#study-panel` com corpo `#body-estudos`, exibida abaixo (ou ao lado) do board.
- **`app.js`**: no bloco de fetch de `handleSubmit`, buscar a aba de estudos junto das outras 3 (mesmo `Promise.all`, mesma pipeline `parseCsv` → `filterRows`) e renderizar com `renderStudyList`. A visibilidade de `#study-panel` entra no bloco de hide/show de `showState` (idle/loading/error escondem, success mostra), igual aos demais elementos.

**Edge case a tratar na implementação:** `filterRows` filtra por `row[0]` (o `nome`), então linhas sem nome já são descartadas sem código novo. Se a aba não existir na planilha (retorno vazio/erro), o painel deve mostrar estado vazio ("Nenhum item de estudo"), não quebrar o board — mesmo tratamento tolerante do `fetch` que hoje retorna `[]` em `!res.ok`.

---

## 2. Baixar planilha-modelo com cabeçalhos

**O que:** Botão que baixa um arquivo `.csv` vazio (sem linhas de dados) contendo apenas a **linha de cabeçalho** com os nomes das colunas esperadas, para o usuário abrir/importar no Google Sheets e começar a preencher já no formato certo.

**Por que:** Hoje o usuário precisa adivinhar a ordem das colunas. Um modelo pronto elimina erro de schema (que é a causa de cards renderizados errados).

**Onde vive:**
- **`ui.js`** ou **`config.js`**: constante com os cabeçalhos do modelo, ex. `TEMPLATE_HEADERS = ['Título', 'Descrição', 'Data', 'Prioridade']` (e, se a feature 1 entrar, um segundo modelo com `STUDY_COLUMNS`). Evita string literal solta dentro da função de download.
- **`app.js`**: `buildTemplateCsv()` (retorna a string CSV com a linha de cabeçalho, reaproveitando `csvEscape` já existente) + `downloadTemplateCsv()` seguindo exatamente o mesmo padrão de `downloadBoardCsv` (Blob com BOM `﻿`, `URL.createObjectURL`, `a.download`, `revokeObjectURL`).
- **`index.html`**: novo botão `#template-btn` nas `.header-actions`, ao lado de `#csv-btn`.
- **`showState` (ui.js)**: incluir `#template-btn` no bloco de hide/show junto dos outros botões de export.
- **Registro do listener**: `document.getElementById('template-btn').addEventListener('click', downloadTemplateCsv)` na seção de inicialização de `app.js` (onde já estão os listeners de `download-btn`/`csv-btn`/`json-btn`), **não** dentro de `handleSubmit`.

**Edge case:** Nenhum previsto — é geração estática a partir de uma constante.

---

## 3. Animação "forca" de atraso (gamificação estilo Duolingo)

**O que:** Conforme a data de uma tarefa fica cada vez mais vencida, o card ganha uma animação/ilustração progressiva no estilo jogo da forca — quanto mais dias de atraso, mais "avançado" o desenho fica. É um reforço visual lúdico (Duolingo-like) para chamar atenção a tarefas abandonadas.

**Por que:** O indicador atual de atraso (`card-date--overdue` + "há N dias") é discreto. Uma progressão visual cria urgência emocional e engajamento sem depender do usuário ler o texto.

**Onde vive:**
- **`ui.js`**: constante `OVERDUE_STAGES` no topo — mapeamento de faixas de dias de atraso para o estágio da animação, ex. `[{ minDays: 1, stage: 1 }, { minDays: 3, stage: 2 }, { minDays: 7, stage: 3 }, { minDays: 14, stage: 4 }]`. É a fonte autoritativa das faixas; nada de números mágicos dentro da função de render. Uma função pura `overdueStage(daysLate)` retorna o estágio a partir da constante.
- **`renderCard` (ui.js)**: o cálculo do atraso deve reutilizar `parsePtBrDate(date)` e o `delta` já computado no bloco de data (não instanciar `new Date(str)` para parsing). Quando `delta < 0`, aplicar ao card uma classe de estágio, ex. `card.dataset.overdueStage = overdueStage(Math.abs(delta))` (ou classe `card--forca-N`). A classe apenas marca o estágio; a aparência é 100% CSS.
- **`style.css`**: toda a parte visual (as "partes da forca", cores, `@keyframes` da animação) vive em CSS, dirigida pela classe/`data-overdue-stage` de estágio. Cores usadas em mais de um contexto vão para variáveis em `:root` (ex. `--forca-stroke`), nunca hex solto. A animação é declarativa (CSS `@keyframes` / `transition`), **sem** timer JS nem estado mutável de animação — o "avanço" é determinístico pelo estágio, recalculado a cada render.

**Edge case a tratar:** Tarefas sem data ou na coluna "Done" não devem mostrar a forca (sem `delta` negativo → sem estágio). Respeitar `prefers-reduced-motion` no CSS para desativar a animação de quem pediu menos movimento.

---
