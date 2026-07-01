# Implements — Ciclo 23

## 1. Consolidar ordenação em um único `<select>`

**Tarefa:** As três variáveis module-level `sortEnabled`/`dateSortEnabled`/`titleSortEnabled` e os três botões `#sort-btn`/`#date-sort-btn`/`#title-sort-btn` foram substituídos por uma única `let sortMode` e um único `<select id="sort-select">` com as 4 opções (Original, Prioridade, Data, A-Z). `handleSubmit` passou a checar `sortMode` diretamente. `STORAGE_KEYS` e a persistência em `localStorage` migraram de 3 chaves para 1 (`sortMode`). O atalho `S` agora cicla entre os 4 modos via uma nova constante `SORT_MODES` (`app.js`) em vez de clicar um botão binário.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Timeout em requisições fetch

**Tarefa:** Nova constante `FETCH_TIMEOUT_MS` (`config.js`) e nova função `fetchWithTimeout(url)` (`sheets.js`), que usa `AbortController` para cancelar a requisição após o timeout. Os três pontos que chamavam `fetch(url)` diretamente (`fetches.map` em `handleSubmit`, `fetchListNames`, `fetchExtraList`) passaram a chamar `fetchWithTimeout(url)` — exatamente as 3 ocorrências que justificam a extração pela regra do projeto.

**Edge case:** Nenhum — o `catch` já existente em cada um dos 3 pontos (retorno de `[]` ou `showState('error', ...)`) já cobre o erro de abort sem mudança estrutural.

**Solução:** N/A.

---

## 3. Duplicar tarefa

**Tarefa:** Novo botão `.card-duplicate-btn` nas ações do card (`ui.js`, `renderCard`). `openNewTaskModal` passou a aceitar um parâmetro opcional `prefill` (`{ name, desc, date, priority }`, `date` em formato ISO); sem argumento, comportamento idêntico ao anterior. O listener de delegação em `#board` (`app.js`) ganhou um ramo para `.card-duplicate-btn` que lê o `dataset` do card e abre o modal pré-preenchido com nome + " (cópia)". Extraídas `toIsoDate`/`toPtBrDate` (`ui.js`, junto de `parsePtBrDate`) para a conversão de data em ambas as direções — `submitNewTask` foi atualizada para usar `toPtBrDate` em vez da inversão inline que já existia.

**Edge case:** A conversão de data pt-BR → ISO só existia na direção inversa (`submitNewTask`, ISO → pt-BR). Extrair as duas direções como funções nomeadas evita que o formato de data fique implícito em dois lugares — mesma preocupação da restrição `constante-enterrada` sobre parsing de data.

**Solução:** `toIsoDate`/`toPtBrDate` adicionadas junto de `parsePtBrDate` em `ui.js`; `submitNewTask` refatorada para usar `toPtBrDate` em vez de repetir `isoDate.split('-').reverse().join('/')`.

---

## 4. Estado vazio de coluna com ação rápida

**Tarefa:** `renderColumn` (`ui.js`) passou a inserir um `<button class="empty-column-cta">+ Nova Tarefa</button>` dentro do `.empty-column` quando a coluna está vazia. O listener de delegação em `#board` (`app.js`) ganhou um ramo para `.empty-column-cta` que chama `openNewTaskModal()` sem prefill.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 5. Menu "Baixar" consolidado

**Tarefa:** Os três botões `#download-btn`/`#json-btn`/`#csv-btn` foram agrupados dentro de um novo `#export-menu-panel`, revelado por `#export-menu-btn` (`index.html`). Listener de toggle, de fechamento ao clicar em qualquer botão interno e de fechamento ao clicar fora do menu registrados na seção de inicialização de `app.js` (não em `handleSubmit`). `showState` (`ui.js`) atualizado para esconder/mostrar `#export-menu-btn` no lugar dos três botões individuais. Novo `.export-menu-panel` em `style.css`, reaproveitando a mesma sombra/raio de borda de `.modal`.

**Edge case:** O rótulo original proposto em `FEATURES.md` era "Exportar ▾", mas o projeto já tem um botão distinto `#export-btn` rotulado "Exportar" (copia o board como texto para a área de transferência — ação diferente de baixar arquivo). Manter o mesmo rótulo nos dois controles lado a lado confundiria o usuário sobre qual botão faz o quê.

**Solução:** O novo botão foi rotulado "Baixar ▾" em vez de "Exportar ▾", mantendo os IDs (`export-menu-btn`/`export-menu-panel`) como descrito, mas evitando a colisão semântica com `#export-btn`.

---

## 6. Campo "Responsável" por tarefa

**Tarefa:** Nova constante `BOARD_RANGE = 'A3:E'` (`config.js`), usada como valor padrão de `buildSheetUrl` (`sheets.js`), substituindo o literal `'A3:D'` hardcoded. `renderCard` (`ui.js`) passou a ler `row[4]` como `responsavel`, gravar em `card.dataset.responsavel` e renderizar um badge `.card-responsavel` quando presente (mesma declaração CSS de `.study-card-status`, sem nova cor). `filterCards` inclui o responsável na busca combinada. `TEMPLATE_HEADERS` ganhou o quinto item `'Responsável'`. As três representações de export que já replicavam os mesmos 4 campos do card (`buildBoardCsv`, `buildBoardJson`, cópia CSV por coluna via `Shift+Ctrl+Header`) foram atualizadas simultaneamente para incluir o quinto campo, evitando divergência entre os três formatos.

**Edge case:** Nenhum.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.21` para `1.22`, seguindo a convenção do projeto de versionar a cada ciclo com features implementadas (o ciclo anterior, documentação-only, não bumpou a versão).
