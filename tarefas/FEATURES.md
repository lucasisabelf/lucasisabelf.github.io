# Features Sugeridas — Sprint Board

Ordenadas por impacto × esforço (maior impacto, menor esforço primeiro).

---

## 1. Contador de cards por coluna

**O que:** Exibir o número de tarefas no cabeçalho de cada coluna — ex: `To Do (4)`.

**Por que:** Dá visibilidade imediata da distribuição do trabalho sem precisar contar manualmente.

**Como:** Em `ui.js`, ao final de `renderColumn`, atualizar o texto do `.column-header` correspondente via `closest('.column').querySelector('.column-header')`. Estender com `(${rows.length})` se `rows.length > 0`, ou omitir se vazio. Sem alteração em `index.html` ou `style.css`.

---

## 2. Persistência da última URL carregada

**O que:** Salvar a URL carregada com sucesso no `localStorage` e restaurá-la automaticamente na próxima visita.

**Por que:** Elimina a fricção de colar ou selecionar a planilha toda vez que a página é aberta — comportamento esperado para quem usa o board diariamente.

**Como:** Em `app.js`, dentro do bloco `try` de `handleSubmit`, após `showState('success')`, adicionar `localStorage.setItem('lastSheet', input)`. No final de `app.js`, antes de `populateSelect()`, verificar `localStorage.getItem('lastSheet')` e, se existir, preencher `#sheet-url` e chamar `handleSubmit()`.

---

## 3. Board compartilhável via URL

**O que:** Ler o parâmetro `?sheet=<URL>` da query string ao carregar a página e pré-popular o input, carregando o board automaticamente.

**Por que:** Permite bookmarking e compartilhamento direto de um board específico — sem precisar colar a URL toda vez.

**Como:** Em `app.js`, antes de `populateSelect()`, usar `new URLSearchParams(location.search).get('sheet')`. Se presente, preencher `#sheet-url` e chamar `handleSubmit()`. O link "Ir para planilha" já existe (`#edit-link`) — adicionar um segundo link "Copiar link do board" que monta `location.origin + location.pathname + '?sheet=' + encodeURIComponent(input)` e copia via `navigator.clipboard.writeText`.

---

## 4. Destaque visual de datas vencidas

**O que:** Colorir em vermelho o badge de data quando o prazo já passou (data < hoje).

**Por que:** Torna tarefas atrasadas imediatamente visíveis sem precisar ler cada card.

**Como:** Em `ui.js`, em `renderCard`, após criar `dt` com `card-date`, tentar parsear `date` como `Date`. Se `new Date(date) < new Date()`, adicionar classe `card-date--overdue` ao elemento. Em `style.css`, adicionar `.card-date--overdue { background: #fff5f5; color: #c53030; }`.

---

## 5. Botão de atualizar board

**O que:** Um botão de refresh (ícone ↻ ou texto "Atualizar") que recarrega os dados da planilha já carregada sem precisar clicar em "Carregar" novamente.

**Por que:** Útil quando o board fica aberto o dia todo e o usuário quer ver mudanças na planilha sem recarregar a página manualmente.

**Como:** Em `index.html`, adicionar `<button id="refresh-btn" class="hidden">↻ Atualizar</button>` próximo ao `#edit-link`. Em `app.js`, após `showState('success')`, remover a classe `hidden` do botão e adicionar listener que chama `handleSubmit()` (já reutiliza a URL do input). Em `style.css`, estilizar similar ao `.edit-link`.

---

## 6. Auto-refresh configurável

**O que:** Opção de recarregar o board automaticamente a cada N minutos (ex: 5 min), com um contador visível e botão para pausar.

**Por que:** Transforma o board em um painel passivo — útil em TVs ou monitores secundários durante o sprint.

**Como:** Em `app.js`, após `showState('success')`, iniciar `setInterval(() => handleSubmit(), intervalMs)` e guardar o ID retornado em uma variável de módulo `let refreshTimer`. Limpar com `clearInterval(refreshTimer)` no início de cada `handleSubmit`. Em `index.html`, adicionar `<label>` com `<input type="checkbox" id="auto-refresh">` e `<select id="refresh-interval">` com opções 1/5/10 min. Leitura dos valores ao configurar o interval.

---

## 7. Filtro de cards por texto

**O que:** Input de busca que filtra os cards visíveis em todas as colunas pelo texto do título ou descrição.

**Por que:** Boards com muitos itens se tornam difíceis de navegar; um filtro rápido resolve sem precisar abrir a planilha.

**Como:** Em `index.html`, adicionar `<input id="filter-input" placeholder="Filtrar tarefas...">` dentro do `.app-header`, abaixo do `.input-row`, visível apenas quando o board está ativo. Em `ui.js`, criar `filterCards(query)` que itera sobre todos `.card` e alterna `.hidden` conforme `.card-title.textContent` ou `.card-desc.textContent` inclua `query` (case-insensitive). Em `app.js`, adicionar listener `input` no `#filter-input`. Em `showState`, limpar o filtro ao sair do estado `success`.

---

## 8. Indicador de prioridade nos cards

**O que:** Exibir uma badge colorida de prioridade (Alta / Média / Baixa) nos cards, lida de uma 4ª coluna da planilha.

**Por que:** Permite priorizar o trabalho visualmente dentro da própria coluna, sem depender de ordenação manual na planilha.

**Como:** Em `sheets.js`, alterar `buildSheetUrl` para usar `range=A3:D` (em vez de `A3:C`). Em `ui.js`, em `renderCard`, ler `row[3]` como `priority`. Criar um mapa `{ 'Alta': 'priority--high', 'Média': 'priority--mid', 'Baixa': 'priority--low' }` e adicionar um `<span class="card-priority ${cls}">` ao card se a coluna existir. Em `style.css`, definir as três variantes com cores correspondentes (vermelho, amarelo, cinza).

---

## 9. Título da aba refletindo o estado do board

**O que:** Atualizar `document.title` para mostrar a contagem de itens em progresso — ex: `Sprint Board — 2 em andamento`.

**Por que:** Útil ao alternar entre abas: dá contexto imediato sobre o estado do sprint sem precisar focar a aba do board.

**Como:** Em `app.js`, dentro de `handleSubmit`, após o `Promise.all`, calcular `results[1].length` (In Progress) e chamar `document.title = results[1].length > 0 ? \`Sprint Board — ${results[1].length} em andamento\` : 'Sprint Board'`. Nenhum arquivo além de `app.js` precisa ser alterado.

---

## 10. Modo escuro

**O que:** Toggle de tema claro/escuro com preferência salva no `localStorage`, respeitando também `prefers-color-scheme`.

**Por que:** Reduz fadiga visual para quem usa o board à noite ou em ambientes com pouca luz — e é a feature de polish mais requisitada em ferramentas de produtividade.

**Como:** Em `style.css`, migrar todas as cores hardcoded para variáveis CSS no `:root` (ex: `--bg: #f0f2f5`, `--surface: #fff`, `--text: #1a202c`). Adicionar bloco `[data-theme="dark"] { --bg: #0f1117; --surface: #1e2130; --text: #e2e8f0; ... }`. Em `index.html`, adicionar `<button id="theme-toggle">` no header. Em `app.js` (ou novo `theme.js`), ler `localStorage.getItem('theme')` e `window.matchMedia('(prefers-color-scheme: dark)')` para definir o atributo inicial; o botão alterna `document.documentElement.dataset.theme` e persiste no `localStorage`.

---

## 11. Pop-up de nova tarefa

**O que:** Modal com campos Nome e Descrição que captura a data atual, copia os dados formatados para o clipboard e abre a planilha automaticamente após 1 segundo.

**Por que:** Permite adicionar uma tarefa à planilha sem sair do board — o usuário preenche o form, o dado já vai para o clipboard e a planilha abre pronta para colar na linha correta.

**Como:**

*`index.html`* — envolver `#edit-link` em `<div class="header-actions">` e adicionar `<button id="new-task-btn" class="new-task-btn hidden">+ Nova Tarefa</button>` ao lado. Adicionar o markup do modal antes de `</main>`:
```html
<div id="new-task-overlay" class="modal-overlay hidden" role="dialog" aria-modal="true">
  <div class="modal">
    <h2 class="modal-title">Nova Tarefa</h2>
    <div class="modal-field">
      <label for="task-name">Nome</label>
      <input id="task-name" type="text" placeholder="Nome da tarefa" autocomplete="off" />
    </div>
    <div class="modal-field">
      <label for="task-desc">Descrição</label>
      <textarea id="task-desc" placeholder="Descrição (opcional)" rows="3"></textarea>
    </div>
    <div id="modal-feedback" class="modal-feedback hidden"></div>
    <div class="modal-actions">
      <button id="modal-cancel" class="modal-cancel-btn">Cancelar</button>
      <button id="modal-submit" class="modal-submit-btn">Adicionar</button>
    </div>
  </div>
</div>
```

*`style.css`* — adicionar estilos para `.header-actions` (flex, gap 1rem, margin-top .8rem), `.new-task-btn` (estilo secundário, borda azul, fundo transparente), `.modal-overlay` (fixed, inset 0, backdrop rgba(0,0,0,.45), flex center, z-index 100), `.modal` (background #fff, border-radius 12px, padding 1.5rem, width min(420px, 90vw), box-shadow), `.modal-field` + `label` + `input` + `textarea`, `.modal-actions` (flex, justify-content flex-end, gap .5rem), `.modal-feedback` (fundo #f0fff4, borda verde, border-radius 6px, padding .6rem).

*`ui.js`* — adicionar três funções:
- `openNewTaskModal()` — limpa os campos, esconde feedback, remove `hidden` do overlay, dá foco em `#task-name`.
- `closeNewTaskModal()` — adiciona `hidden` ao overlay.
- `submitNewTask()` — lê `#task-name` (obrigatório) e `#task-desc`; formata `new Date().toLocaleDateString('pt-BR')` como data; monta string tab-separated `name\tdesc\tdate` (TSV cola direto em células separadas no Sheets); chama `navigator.clipboard.writeText(row)`; exibe `#modal-feedback` com "Copiado! Abrindo planilha..."; desabilita `#modal-submit`; após `setTimeout(..., 1000)` abre `document.getElementById('sheet-url').value` com `window.open` e chama `closeNewTaskModal()`.

Atualizar `showState` em `ui.js` para esconder `#new-task-btn` em todos os estados e mostrá-lo apenas em `success`.

*`app.js`* — adicionar os listeners após `populateSelect()`:
```js
document.getElementById('new-task-btn').addEventListener('click', openNewTaskModal);
document.getElementById('modal-cancel').addEventListener('click', closeNewTaskModal);
document.getElementById('modal-submit').addEventListener('click', submitNewTask);
document.getElementById('new-task-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeNewTaskModal();
});
document.getElementById('task-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitNewTask();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNewTaskModal();
});
```
