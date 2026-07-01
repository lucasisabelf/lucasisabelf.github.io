# Implements — Ciclo 27

## 1. Consolidar auto-refresh no menu "Visualização"

**Tarefa:** `#auto-refresh-controls` removido como bloco separado; o checkbox `#auto-refresh` e o `<select id="refresh-interval">` movidos para dentro de `#view-menu-panel`, ambos reaproveitando `.header-action-btn`/`.export-menu-panel .header-action-btn` (nenhuma regra CSS nova para o layout do controle em si). `showState` (`ui.js`) removeu as linhas de hide/show de `#auto-refresh-controls`. CSS morto (`.auto-refresh-controls`, `.auto-refresh-controls select`, referência no `@media print`) removido de `style.css`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Mensagens de erro específicas por tipo de falha

**Tarefa:** O `catch` de `handleSubmit` (`app.js`) passou a checar `err.name === 'AbortError'` (erro lançado por `fetchWithTimeout` após as 2 tentativas já esgotadas) e exibir uma mensagem específica de timeout/rede; o caso de HTML retornado pela planilha continua usando `err.message` como antes.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Progresso do checklist

**Tarefa:** Quando `parseChecklist(desc)` retorna itens, `renderCard` (`ui.js`) calcula `checklist.filter(i => i.done).length` sobre o array já produzido e insere um `<span class="card-checklist-progress">X/Y</span>` dentro de `.card-title`, sem reprocessar a descrição.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Destaque visual em tarefas sem responsável

**Tarefa:** `renderCard` (`ui.js`) adiciona a classe `card--unassigned` ao `.card` quando `responsavel` está vazio. `.card--unassigned { border: 1px dashed var(--border-input); }` em `style.css`, reaproveitando a variável de cor já existente.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 5. Ordenação combinada (prioridade + data)

**Tarefa:** A lógica de comparação de datas de `sortByDate` foi extraída para `compareByDate(a, b)` (`ui.js`); `sortByDate` agora só chama `rows.sort(compareByDate)`, e `sortByPriority` usa `compareByDate` como critério de desempate (`... || compareByDate(a, b)`) quando duas tarefas têm a mesma prioridade.

**Edge case:** Nenhum — o tratamento de datas ausentes (`null` vai para o fim) foi preservado exatamente igual ao original de `sortByDate`.

**Solução:** N/A.

---

## 6. Tags livres por tarefa

**Tarefa:** `BOARD_RANGE` (`config.js`) ampliado de `'A3:F'` para `'A3:G'`. `renderCard` (`ui.js`) lê `row[6]` como `tagsRaw`, grava `card.dataset.tags`, e renderiza um `<span class="card-tag">` por tag dentro de `.card-tags`. `.card-tag` foi adicionado ao seletor já combinado `.study-card-status, .card-responsavel` (ciclo 23) em vez de uma nova regra CSS. `filterCards` inclui `card.dataset.tags` na busca combinada. O listener de delegação em `#board` (`app.js`) ganhou um ramo para `.card-tag`, com a mesma lógica de filtro-por-clique já usada por `.card-priority` (2 ocorrências do mesmo padrão — não justifica extração ainda pela regra do projeto). `TEMPLATE_HEADERS` e as 3 representações estruturadas de export (`buildBoardCsv`, `buildBoardJson`, cópia CSV por coluna) ganharam `Tags`/`card.dataset.tags` como sétimo campo, pela mesma paridade já aplicada a Responsável e Link.

**Edge case:** Nenhum — a busca por tag reaproveita o mesmo `combined.includes(t)` (substring) do filtro de texto já existente, não uma regra de correspondência nova.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.25` para `1.26`. O Passo 0d verificou `invertexto.com/matuto` novamente — a seção `##### features` continha a mesma sugestão já implementada no ciclo 26 ("fonte para disléxicos"), confirmada como já presente no código e não duplicada em `FEATURES.md`.
