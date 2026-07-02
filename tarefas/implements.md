# Implements — Ciclo 32

## 1. Prevenir chamadas concorrentes de handleSubmit

**Tarefa:** Novo `let isLoading = false;` (`app.js`). `handleSubmit` retorna imediatamente se já houver uma requisição em andamento; a flag é setada antes do primeiro `showState('loading')` e resetada em um único `finally` que cobre tanto o caminho de sucesso quanto o `catch`.

**Edge case:** `FEATURES.md` descrevia resetar `isLoading = false` "em todos os caminhos de saída (sucesso e o catch)" separadamente.

**Solução:** Usado `try/finally` em vez de repetir `isLoading = false` em cada `return`/fim de bloco — um único ponto de reset que cobre todos os caminhos de saída sem duplicar a atribuição, mais robusto a um futuro `return` antecipado esquecido dentro do `try`.

---

## 2. Aria-label nos botões somente-ícone

**Tarefa:** `#help-btn`, `#theme-toggle`, `#dyslexic-toggle`, `#filter-clear-btn` e `#back-to-top` (`index.html`) ganharam `aria-label` com o mesmo texto do `title` já existente.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 3. Selecionar todos no modo de seleção

**Tarefa:** Novo `<button id="select-all-btn">` em `#bulk-actions-bar` (`index.html`). Listener em `app.js` marca `checkbox.checked = true` e adiciona `dataset.title` a `selectedTitles` para todo `.card:not(.hidden) .card-select-checkbox`, chamando `updateSelectedCount(selectedTitles.size)` uma única vez ao final — mesma função já usada pelo listener de `change` individual.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Detalhe do card mostra Responsável/Link/Tags/Checklist

**Tarefa:** Novos `#card-detail-responsavel`, `#card-detail-link` e `#card-detail-tags` (`index.html`, este último reaproveitando a classe `.card-tags` já existente). `openCardDetail` (`ui.js`) passa a ler `responsavel`/`link`/`tags` de `card.dataset` e preenchê-los/escondê-los como já fazia para `date`/`priority`. Para a descrição, reaproveita `parseChecklist(desc)` já existente — quando retorna itens, `#card-detail-desc` recebe um `<ul class="card-checklist">`/`<li class="card-checklist-item">` (mesmas classes de `renderCard`, garantindo o mesmo visual via CSS já existente) em vez do texto cru; caso contrário mantém o texto simples.

**Edge case:** A criação do `<ul>`/`<li>` do checklist e dos chips de tag (`.card-tag`) agora existe em dois lugares (`renderCard` e `openCardDetail`). Pela convenção do projeto ("3 ocorrências justificam extração, 2 não"), isso ainda não justifica um helper compartilhado.

**Solução:** Duplicado inline em `openCardDetail`, reaproveitando as MESMAS classes CSS (`card-checklist`, `card-checklist-item`, `card-tag`) usadas por `renderCard`, para que o visual seja idêntico sem precisar de CSS novo nem de uma extração prematura para apenas 2 ocorrências. Se uma 3ª ocorrência aparecer futuramente, deve ser extraída (ver restrição `terceira-ocorrencia-nao-extraida`).

---

## 5. Modo somente leitura via `?readonly=1`

**Tarefa:** `app.js`, no bloco de inicialização (junto de `urlSheet`/`urlFilter`, antes do primeiro `handleSubmit()`), lê `readonly === '1'` e, se verdadeiro, adiciona `board--readonly` a `document.documentElement`. `showState` (`ui.js`), no bloco de sucesso, esconde `#new-task-btn`/`#select-mode-btn` de novo se a classe estiver presente. `renderCard` (`ui.js`) não cria o botão "Duplicar" quando a classe está presente.

**Edge case:** `FEATURES.md` descrevia ler `new URLSearchParams(location.search).get('readonly')` como uma chamada isolada. O bloco de inicialização já chamava `new URLSearchParams(location.search)` duas vezes (para `urlSheet` e `urlFilter`) antes desta feature — adicionar uma terceira chamada igual no mesmo bloco cruza o limiar de "3 ocorrências justificam extração" do projeto.

**Solução:** Extraído `const urlParams = new URLSearchParams(location.search);` uma única vez no topo do bloco, reaproveitado por `urlSheet`, `urlFilter` e `urlReadonly` — encontrado e corrigido na autorrevisão (Fase 1 do `/review`).

---

## 6. Indicador visual de modo somente leitura

**Tarefa:** Novo `<span id="readonly-badge">` (`index.html`) ao lado do `<h1>Sprint Board`. No mesmo bloco onde `board--readonly` é adicionado (`app.js`), `hidden` é removido do selo.

**Edge case:** `FEATURES.md` não especificava estilo visual para o selo.

**Solução:** Reaproveitada a classe `.version-badge` já existente (mesmo visual de pílula pequena usado pelo número de versão ao lado do título) em vez de criar uma regra CSS nova com as mesmas propriedades — consistente com a restrição `css-duplicado-entre-classes`.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.30` para `1.31`. Ciclo cumpriu a nova regra de distribuição de esforço: feature 5 (Longa) e feature 4 (Média), as demais Curtas. Fila de falhas (`FALHAS.md`) não tinha itens `aberto`/`em análise` pendentes neste ciclo. Passo 0d (invertexto.com/matuto) verificado; nenhuma sugestão nova sobreviveu ao filtro de segurança/sentido para o projeto.
