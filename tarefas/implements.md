# Implements — Ciclo 31

## 1. Padronizar exports para respeitar o filtro ativo

**Tarefa:** `buildBoardCsv`, `buildBoardJson` (`app.js`) e os dois handlers de atalho de `.column-header` (Shift/Ctrl+Shift) passaram a usar `.card:not(.hidden)` em vez de `.card`, alinhando com `buildBoardText`/`downloadIcsCalendar`, que já respeitavam o filtro ativo.

**Edge case:** Nenhum — sem filtro ativo, `.card:not(.hidden)` é equivalente a `.card`.

**Solução:** N/A.

---

## 2. Limite real de 80 caracteres no campo Nome

**Tarefa:** `<input id="task-name">` ganhou `maxlength="80"`, igual ao padrão já usado por `#task-desc` (`maxlength="300"`).

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Consolidar ações do card em menu "Mais ▾"

**Tarefa:** `renderCard` (`ui.js`) mantém `.card-copy-btn` e o link (quando presente) soltos em `.card-actions`; `.card-ask-claude-btn`, `.card-calendar-btn`, `.card-whatsapp-btn` e `.card-duplicate-btn` passaram para dentro de um novo `.card-more-panel`, revelado por `.card-more-btn`. O painel reaproveita a classe `.export-menu-panel` já existente (mesmo CSS de posicionamento/sombra dos menus do header, sem regra nova) — `.export-menu-panel .header-action-btn` ganhou `.card-action-btn` no mesmo seletor combinado para herdar o padding/alinhamento. O listener de delegação em `#board` (`app.js`) ganhou um ramo para `.card-more-btn`; o listener global de fechar-ao-clicar-fora ganhou um segundo `querySelectorAll('.card-more-panel')` no mesmo corpo já existente.

**Edge case:** Como já previsto em `FEATURES.md`, `setupDropdownMenu` (IDs fixos) não se aplica a N painéis por card sem ID único — a implementação usa delegação de evento, não o helper existente, o que não conta como uma nova "3ª ocorrência não extraída" (é uma variante estrutural diferente, não uma cópia do mesmo padrão).

**Solução:** N/A — resolvido exatamente como descrito.

---

## 4. Seleção múltipla de cards com ações em lote

**Tarefa:** Novo `#select-mode-btn` no header e `#bulk-actions-bar` acima do `#board`. `renderCard` (`ui.js`) ganhou um `<input type="checkbox" class="card-select-checkbox">` por card, escondido por padrão e revelado via `.board--selecting .card-select-checkbox`. Novo `let selectMode`/`let selectedTitles` (`app.js`, escopo de UI, não persistido). A lógica de montar uma linha CSV, antes só dentro de `buildBoardCsv`, foi extraída para `buildCardRowCsv(card, colName)`, reaproveitada pelo export completo e pelo novo botão "Baixar CSV selecionados".

**Edge case:** `showState` (`ui.js`) não pode resetar `selectMode`/`selectedTitles` diretamente (variáveis de `app.js`, fora do escopo de `ui.js` por convenção do projeto — `ui.js` nunca lê variáveis de estado de `app.js` diretamente, sempre recebe por parâmetro). Sem resetar esse estado a cada novo carregamento, clicar em "Selecionar" após um reload reabriria o modo já teria `selectMode` desatualizado (poderia inverter para `false` em vez de `true` no primeiro clique).

**Solução:** `handleSubmit` (`app.js`) reseta `selectMode = false` e `selectedTitles.clear()` no início, antes de qualquer fetch — o reset de estado JS fica em `app.js` (dono da variável), e `showState` (`ui.js`) só reseta o DOM correspondente (`.board--selecting`, `#bulk-actions-bar`, `#select-mode-btn`), mantendo a separação de camadas already estabelecida.

---

## 5. Indicador "N selecionados"

**Tarefa:** Nova `updateSelectedCount(count)` (`ui.js`), chamada pelo listener de `change` de `.card-select-checkbox` e pelo toggle de `#select-mode-btn` (`app.js`), atualizando `#selected-count`.

**Edge case:** Nenhum.

**Solução:** `FEATURES.md` descrevia "uma linha a mais dentro do listener já existente" (sem função nova); como a atualização do contador acontece em 2 pontos (mudança de checkbox e toggle do modo), inline duplicaria a mesma linha 2×. Extraída como função nomeada, mesmo padrão já usado por `updateActivityBadge` — não é uma divergência de fundo, só uma pequena adaptação para não duplicar 1 linha.

---

## 6. Atalho de teclado para alternar modo de seleção

**Tarefa:** Tecla `V` dispara `document.getElementById('select-mode-btn').click()` (`app.js`, mesmo padrão de `D`/`T`). Nova linha na tabela de atalhos (`#help-overlay`, `index.html`).

**Edge case:** Nenhum.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.29` para `1.30`. O Passo 0d verificou `invertexto.com/matuto` novamente — mesma sugestão do WhatsApp já implementada, confirmada e não duplicada. Feature 1 corrigiu uma inconsistência real pré-existente (exports CSV/JSON e atalhos de coluna ignoravam o filtro ativo, diferente de `.md`/`.ics`), encontrada durante a análise do projeto para este ciclo.
