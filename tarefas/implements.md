# Implements — Sprint Board

## 1. Porcentagem de conclusão no título da aba

**Tarefa:** Em `renderSummary` (ui.js), após calcular `pct`, adicionada atualização de `document.title`: `pct > 0 ? \`Sprint Board · ${pct}%\` : 'Sprint Board'`. Em `handleSubmit` (app.js), removida a atribuição anterior a `document.title` que exibia "N em andamento" — o título agora é responsabilidade exclusiva de `renderSummary`, que tem o `pct` calculado.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Botão "↑ Topo" flutuante

**Tarefa:** Em `index.html`, adicionado `<button id="back-to-top" class="back-to-top-btn hidden">↑</button>` antes de `#help-overlay`. Em `app.js`, registrados dois listeners na seção de inicialização: `scroll` em `window` que alterna `.hidden` com base em `window.scrollY <= 300`; e `click` no botão que chama `window.scrollTo({ top: 0, behavior: 'smooth' })`. Em `style.css`, adicionadas regras `position: fixed; bottom: 1.5rem; right: 1.5rem` com `border-radius: 50%` e `z-index: 50`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Ctrl+Enter no textarea submete o modal

**Tarefa:** Em `app.js`, adicionado listener `keydown` em `#task-desc` que chama `submitNewTask()` quando `e.ctrlKey || e.metaKey` e `e.key === 'Enter'`. O listener é independente do listener `input` existente (auto-resize) e registrado na mesma seção de inicialização.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Escape limpa o filtro quando o input está focado

**Tarefa:** Em `app.js`, o handler de `Escape` no listener `keydown` de `document` foi expandido com uma guarda inicial: se `document.activeElement === filterInput && filterInput.value`, limpa o filtro (zera valor, chama `filterCards('')`, esconde `filter-clear-btn` e `filter-count`) e retorna. O comportamento anterior (fechar modal + esconder help overlay) permanece como fallback.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Botão de reset geral de configurações

**Tarefa:** Em `app.js`, adicionada constante `STORAGE_KEYS` no topo do arquivo (junto das demais variáveis de estado) com todas as chaves de `localStorage` usadas pelo app. Adicionada `resetAllSettings()` que itera `STORAGE_KEYS.forEach(k => localStorage.removeItem(k))` e chama `location.reload()`. Em `index.html`, adicionado `<button id="reset-settings-btn" class="help-reset-btn">Limpar configurações</button>` dentro do `#help-overlay`, antes do rodapé de ações. Listener registrado na seção de inicialização de `app.js`. Em `style.css`, adicionadas `.help-reset-row` e `.help-reset-btn` com hover vermelho.

**Edge case:** Nenhum

**Solução:** N/A

---
