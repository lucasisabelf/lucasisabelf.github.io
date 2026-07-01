# Implements — Ciclo 24

## 1. Tooltips com atalho de teclado

**Tarefa:** Adicionado/atualizado `title` nos botões do header que já têm um atalho de tecla única documentado em `#help-overlay`: `#compact-btn` ("Compacto (D)"), `#theme-toggle` ("Alternar tema (T)"), `#refresh-btn` ("Atualizar (R)"), `#export-btn` ("Exportar (E)"), `#sort-select` ("Ciclar ordenação (S)") e `#new-task-btn` ("Nova tarefa (N)").

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Mover modelo de planilha para o modal de Ajuda

**Tarefa:** `#template-select`/`#template-btn` removidos de `.header-actions` e movidos para dentro de `#help-overlay`, em uma nova `<p class="help-template-row">` antes de `.help-reset-row`. `showState` (`ui.js`) parou de esconder/mostrar esses dois elementos — sua visibilidade agora é controlada exclusivamente por `toggleHelp()`. Nenhuma mudança em `downloadTemplateCsv`/`populateTemplateSelect` (`app.js`/`ui.js`).

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Consolidar "Compartilhar" em menu dropdown

**Tarefa:** `#copy-link-btn`, `#copy-sheet-btn` e `#export-btn` agrupados em `#share-menu-panel`, revelado por `#share-menu-btn` ("Compartilhar ▾") — mesma estrutura de markup e mesmas classes (`.export-menu`/`.export-menu-panel`) do menu "Baixar" já existente, sem CSS novo. `showState` (`ui.js`) atualizado para esconder/mostrar `#share-menu-btn` no lugar dos três botões individuais. O listener global de "fechar ao clicar fora" (`app.js`), que antes conhecia só `#export-menu-panel` por `getElementById`, foi generalizado para `document.querySelectorAll('.export-menu-panel')` — cobre os dois menus (e qualquer futuro) sem duplicar o listener.

**Edge case:** Nenhum — os dois listeners de toggle (`#export-menu-btn`/`#share-menu-btn`) e os dois de fechar-ao-clicar-em-botão-interno permaneceram como blocos separados de 1 linha cada (2 ocorrências não justificam extração pela regra do projeto); só o listener de fechar-ao-clicar-fora, que já preexistia como um único listener global, foi generalizado — não é uma extração de duplicação, é o mesmo listener operando sobre uma classe em vez de um ID fixo.

**Solução:** N/A.

---

## 4. Retry automático em falha de fetch

**Tarefa:** `fetchWithTimeout(url)` (`sheets.js`) passou a delegar a uma nova `attemptFetch(url)` (a lógica de `AbortController`/timeout de uma única tentativa) e, se a primeira chamada rejeitar, tenta novamente uma vez antes de propagar o erro. Assinatura e os 3 pontos de chamada em `app.js` não mudaram.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 5. Filtro por responsável

**Tarefa:** Novo `<select id="responsavel-filter">` dentro de `#filter-row` (`index.html`), com a opção fixa "Todos os responsáveis". Nova `populateResponsavelFilter(names)` (`ui.js`, mesmo padrão de `populateModeSelect`/`populateTemplateSelect`), chamada em `handleSubmit` (`app.js`) com os responsáveis distintos extraídos de `results.flat()`. `filterCards` ganhou um segundo parâmetro opcional `responsavelFilter` — um card só fica visível se o texto buscado E o responsável selecionado baterem. Todos os pontos que já chamavam `filterCards` (busca por texto, limpar filtro, clique em badge de prioridade, Escape) passaram a repassar o valor atual de `#responsavel-filter` para não perder o filtro de responsável ao interagir com os outros controles.

**Edge case:** O `<div class="filter-row">` não era um contêiner flex — adicionar o select ao lado do campo de busca exigiu envolver `#filter-input`/`#filter-clear-btn` em um novo `<div class="filter-search">` (que herda o `position: relative` que antes vivia em `.filter-row`), para o botão de limpar continuar posicionado sobre o input mesmo com o select ao lado.

**Solução:** `.filter-row` virou `display: flex` com `.filter-search` (`position: relative; flex: 1`) envolvendo input+botão de limpar, e `.filter-select` como estilo do novo select — mudança de layout, não de comportamento.

---

## 6. Campo "Link" opcional por tarefa

**Tarefa:** `BOARD_RANGE` (`config.js`) ampliado de `'A3:E'` para `'A3:F'`. `renderCard` (`ui.js`) lê `row[5]` como `link` e, quando presente, adiciona um `<a class="card-action-btn card-link">🔗</a>` nas ações do card (navegação direta via `href`, sem listener JS — diferente de `.card-calendar-btn`, que baixa arquivo e abre URL). `TEMPLATE_HEADERS` ganhou o sexto item `'Link'`. `buildBoardCsv`, `buildBoardJson` e a cópia CSV por coluna (`Shift+Ctrl+Header`, `app.js`) ganharam `link`/`card.dataset.link` como sexto campo, pela mesma paridade já aplicada ao campo Responsável.

**Edge case:** Como descrito em `FEATURES.md`, "Link" não entra em `filterCards` (busca de texto) nem em `buildBoardText`/`.md` — apenas nos 3 formatos estruturados (CSV/JSON/CSV por coluna). O elemento reaproveita a classe `.card-action-btn` já existente em vez de CSS próprio, seguindo a restrição `css-duplicado-entre-classes` do ciclo anterior.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.22` para `1.23`. `TEMPLATE_HEADERS` (schema do modelo "Tarefas") atualizado para incluir `'Link'`, mantendo paridade com o novo `BOARD_RANGE` de 6 colunas — não estava em `FEATURES.md`, mas decorre diretamente da feature 6 (o modelo de CSV deve refletir todas as colunas que o board agora aceita).
