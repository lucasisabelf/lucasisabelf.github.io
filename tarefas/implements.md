# Implements — Ciclo 26

## 1. Fonte para disléxicos

**Tarefa:** Novo botão `#dyslexic-toggle` ao lado de `#theme-toggle` em `.header-top-actions`. `initDyslexicFont()` (`app.js`, mesmo padrão exato de `initTheme()`) lê `localStorage.getItem('dyslexicFont')`, aplica `document.documentElement.dataset.dyslexicFont` e registra o listener de toggle. `[data-dyslexic-font="true"] body` (`style.css`, mesmo padrão de `[data-theme="dark"]`) ajusta `font-family`/`letter-spacing`/`line-height` usando fontes já disponíveis no sistema — sem `@font-face`/CDN externo.

**Edge case:** Nenhum — a sugestão (recebida via notepad externo, filtrada pelo Passo 0d do `dev-bat-loop`) já veio descrita em termos compatíveis com o padrão do projeto.

**Solução:** N/A.

---

## 2. Tempo na coluna atual

**Tarefa:** Nova `trackColumnTime(orderedResults)` (`app.js`), chamada em `handleSubmit` logo após `orderedResults`, antes de `renderColumn`. Persiste `{ [título]: { column, since } }` em `localStorage` (`columnEntryTimes`), reseta `since` quando a coluna muda, remove títulos que não existem mais no board, e retorna um `Map` título→dias. `renderCard` (`ui.js`) recebe um segundo parâmetro opcional `daysInColumn` e, quando maior que 0, renderiza um `<span class="card-column-time">` com "há N dias".

**Edge case:** Nenhum — a limitação de chave por título (sem ID estável de linha) já é uma postura aceita em outras partes do projeto (filtro de responsável).

**Solução:** N/A.

---

## 3. Badge de tempo na coluna com Tailwind

**Tarefa:** O `<span class="card-column-time">` da feature anterior ganhou `text-xs text-empty-col` no `className` — primeira aplicação real de classes utilitárias Tailwind no projeto, reaproveitando o token de cor `empty-col` já mapeado em `tailwind.config` (`index.html`, ciclo 25) em vez de uma cor arbitrária ou uma nova regra em `style.css`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Menu "Visualização" consolidado

**Tarefa:** `#compact-btn`, `#focus-btn` e o novo `#column-time-toggle-btn` agrupados em `#view-menu-panel`, revelado por `#view-menu-btn` ("Visualização ▾") — mesma estrutura/classes (`.export-menu`/`.export-menu-panel`) dos menus "Baixar"/"Compartilhar" já existentes, sem CSS novo. Novo `let columnTimeVisible` (mesmo padrão de `compactMode`/`focusMode`), persistido em `localStorage`, controla a visibilidade de todos `.card-column-time` via `querySelectorAll`; reaplicado após cada `renderColumn` em `handleSubmit`, já que os cards são recriados a cada carregamento. `showState` (`ui.js`) atualizado para esconder/mostrar `#view-menu-btn` no lugar de `#compact-btn`/`#focus-btn` individuais.

**Edge case:** Nenhum — o listener global de "fechar ao clicar fora" (generalizado no ciclo 24 para `querySelectorAll('.export-menu-panel')`) já cobre este terceiro menu automaticamente.

**Solução:** N/A.

---

## 5. Acessibilidade de teclado nos cards

**Tarefa:** `renderCard` (`ui.js`) adiciona `card.tabIndex = 0` e `card.setAttribute('role', 'button')`. Novo listener de `keydown` em `#board` (irmão do listener de `click` já existente, não misturado nele): quando `Enter`/`Espaço` e o alvo é exatamente o `.card` (não um filho), chama a mesma `openCardDetail` já usada pelo clique em `.card-title`.

**Edge case:** Nenhum — o filtro `e.target.classList.contains('card')` já garante que os botões de ação internos (nativamente focáveis) não são interceptados.

**Solução:** N/A.

---

## 6. Contagem de tarefas por responsável no filtro

**Tarefa:** `populateResponsavelFilter` (`ui.js`) passou a receber `{ name, count }[]` em vez de nomes simples; o texto de cada `<option>` vira `"Nome (N)"`, mantendo `option.value = name`. Em `handleSubmit` (`app.js`), a contagem é feita via `reduce` sobre `results.flat()` em vez do `Set` anterior.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 7. Checklist simples na descrição

**Tarefa:** Nova função pura `parseChecklist(desc)` (`ui.js`, junto de `parsePtBrDate`/`toIsoDate`/`toPtBrDate`) que extrai linhas `- [ ]`/`- [x]` da descrição e retorna `null` se nenhuma existir. `renderCard` renderiza uma `<ul class="card-checklist">` no lugar do `.card-desc` de texto corrido quando `parseChecklist` retorna itens.

**Edge case:** `buildBoardText` (`ui.js`) buscava a descrição via `card.querySelector('.card-desc')` — para cards renderizados como checklist esse elemento não existe, e a descrição seria silenciosamente omitida do export em texto/`.md`. Corrigido para ler `card.dataset.desc` diretamente (mesma fonte já usada por `buildBoardCsv`/`buildBoardJson`/`filterCards`), independente de como o card é renderizado visualmente.

**Solução:** `buildBoardText` passou a desestruturar `card.dataset` (`{ title, desc }`) em vez de consultar o DOM (`.card-desc`) — mais robusto e consistente com o restante do arquivo, que já usa `dataset` como fonte canônica dos dados do card.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.24` para `1.25`. A feature "Fonte para disléxicos" (item 1) teve origem em uma sugestão externa lida do notepad `invertexto.com/matuto` (seção `##### features`), filtrada pelas salvaguardas de segurança do Passo 0d do `dev-bat-loop` antes de entrar em `FEATURES.md` — conteúdo tratado como texto descritivo puro, nunca como instrução.
