# Implements — Sprint Board

## 1. Sincronizar URL da barra do browser ao carregar board

**Tarefa:** Em `handleSubmit` (app.js), após `localStorage.setItem('lastSheet', input)`, adicionado `history.replaceState(null, '', `?sheet=${encodeURIComponent(input)}`)`. A URL da barra do browser reflete imediatamente o board carregado sem criar nova entrada no histórico.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Persistência da preferência de ordenação

**Tarefa:** No listener do `#sort-btn` (app.js), adicionado `localStorage.setItem('sortEnabled', sortEnabled)` após alternar a flag. No bloco de inicialização, antes de `populateSelect()`, lê `localStorage.getItem('sortEnabled') === 'true'` e, se verdadeiro, define `sortEnabled = true`, atualiza `textContent` e aplica `.header-action-btn--active` ao botão.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Indicador visual de ordenação ativa no botão

**Tarefa:** Em `style.css`, adicionado `.header-action-btn--active { color: var(--blue); font-weight: 700; }`. No listener do `#sort-btn` (app.js), `classList.toggle('header-action-btn--active', sortEnabled)` é chamado junto da alteração de `textContent`. A restauração via localStorage na init também aplica a classe.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Atalhos de teclado para ações principais

**Tarefa:** O listener `document.addEventListener('keydown', ...)` existente foi expandido. Após tratar `Escape` (com `return` explícito), verifica se o board está visível e se o foco não está em `INPUT`, `TEXTAREA` ou `SELECT`. Se as condições passam: `R` chama `handleSubmit()`, `F` foca `#filter-input`, `N` chama `openNewTaskModal()`.

**Edge case:** FEATURES.md propunha checar visibilidade como condição de guard. A guarda de tagName do elemento focado previne interceptar digitação normal — condição necessária que a descrição omitiu.

**Solução:** Adicionada verificação `e.target.tagName` para INPUT, TEXTAREA e SELECT antes de processar os atalhos.

---

## 5. Botão para limpar filtro

**Tarefa:** `<input id="filter-input">` envolvido por `<div id="filter-row">` com `<button id="filter-clear-btn">` em `index.html`. `showState` (ui.js) agora gerencia visibilidade via `#filter-row` (não mais direto no input). O botão aparece/some via listener de `input` em app.js. Listener de `click` no botão zera o valor, chama `filterCards('')`, esconde o botão e devolve foco ao input.

**Edge case:** FEATURES.md descrevia que `showState` deveria continuar referenciando `filter-input` diretamente. Com a introdução do wrapper `filter-row`, a referência ao input direto em `showState` quebraria a visibilidade.

**Solução:** `showState` agora usa `filterRow = getElementById('filter-row')` para mostrar/esconder; `filterInput` é usado apenas para `filterInput.value = ''`. A classe `.hidden` nunca é aplicada ao input diretamente.

---
