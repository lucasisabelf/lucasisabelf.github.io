# Implements — Sprint Board

## 1. Seletor de prioridade no modal de nova tarefa

**Tarefa:** Adicionado `<select id="task-priority">` com opções "Sem prioridade", "Alta", "Média", "Baixa" ao modal em `index.html`. Em `ui.js`, `openNewTaskModal` reseta `task-priority.value = ''`. `submitNewTask` lê `document.getElementById('task-priority').value` e inclui como quarta coluna no TSV: `\`${name}\t${desc}\t${date}\t${priority}\``. Em `style.css`, `<select>` dentro de `.modal-field` foi adicionado à regra compartilhada de input/textarea (focus + padding).

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Filtro rápido por prioridade via click no badge

**Tarefa:** Em `renderCard` (ui.js), adicionado `card.dataset.priority = priority` ao lado dos demais `dataset` já existentes. Em `filterCards` (ui.js), o critério de match foi estendido para incluir `card.dataset.priority.toLowerCase()`. Em `app.js`, o listener de delegação de `#board` recebeu um terceiro handler para `.card-priority`: ao clicar, compara `filterInput.value` com o texto do badge — se igual, limpa; caso contrário, seta e filtra. Atualiza `#filter-count` e `#filter-clear-btn` na mesma operação.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Indicador de última atualização no resumo

**Tarefa:** Em `renderSummary` (ui.js), após montar a string de contagens, acrescentado `const hhmm = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); text += \` · Atualizado às ${hhmm}\``. Nenhuma alteração em HTML, CSS ou app.js.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Contador de cards visíveis quando filtro ativo

**Tarefa:** `filterCards` (ui.js) agora retorna o número de cards visíveis (não-hidden). Em `index.html`, adicionado `<span id="filter-count" class="filter-count hidden"></span>` como elemento irmão de `#filter-row` (fora do container para não interferir com o posicionamento absoluto do `#filter-clear-btn`). Em `showState` (ui.js), `#filter-count` é ocultado na seção de hide. Em `app.js`, os listeners de `#filter-input` e `#filter-clear-btn` foram atualizados para mostrar/ocultar e popular `#filter-count`. CSS adiciona `.filter-count` com `display: block` e margem superior.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Download do board como arquivo .md

**Tarefa:** Adicionado `<button id="download-btn" class="header-action-btn hidden">Baixar .md</button>` em `index.html`. Em `app.js`, adicionada `downloadBoardText()` que cria `Blob` com o resultado de `buildBoardText()`, cria um `<a>` temporário com `download='sprint-board.md'`, simula clique e revoga a URL. Listener registrado na seção de inicialização. Em `showState` (ui.js), `#download-btn` gerenciado junto dos demais botões de sucesso.

**Edge case:** Nenhum

**Solução:** N/A

---
