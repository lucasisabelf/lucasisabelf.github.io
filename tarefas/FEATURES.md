# Features Sugeridas — Sprint Board

Ordenadas por impacto × esforço (maior impacto, menor esforço primeiro).

---

## Fix #002 — Lista de Estudos valida aba antes de exibir

**O que:** Quando a aba "Lista de Estudos" não existe na planilha, a API do Google Sheets retorna os dados da primeira aba sem sinalizar erro. O `studyFetch` deve detectar esse caso e retornar `[]`, exibindo "Nenhum item de estudo" em vez de dados da aba errada.

**Por que:** Falha #002 — usuários sem a aba criada veem dados incorretos no painel de estudos.

**Onde vive:**
- **`config.js`**: mudar `STUDY_RANGE` de `'A2:E'` para `'A1:E'` — incluir a linha de cabeçalho para permitir validação.
- **`app.js`**: em `studyFetch`, após `parseCsv`, verificar ANTES de `filterRows`: se `rows[0]` não existe ou `rows[0][0].trim().toLowerCase() !== 'nome'`, retornar `[]` imediatamente (aba errada ou inexistente). Se válido, chamar `filterRows(rows.slice(1))` — `slice(1)` descarta a linha de cabeçalho; `filterRows` descarta as linhas sem nome nos dados restantes.

**Edge case:** `filterRows` filtra por `row[0]` não-vazio — a linha de cabeçalho ('nome') passaria por ele se não fosse descartada antes. Por isso o slice acontece antes de `filterRows`.

---

## 1. Modo Tarefas / Modo Estudos (SPA)

**O que:** Um botão `#mode-btn` no header alterna a visualização entre dois modos mutuamente exclusivos — **Tarefas** (board Kanban + filter row + summary) e **Estudos** (Lista de Estudos). Apenas um painel é visível por vez. O modo é persistido em `localStorage`.

**Por que:** Hoje o board e a lista de estudos aparecem na mesma tela em sequência. Um toggle SPA mantém a interface limpa e focada, seguindo o padrão do projeto.

**Onde vive:**
- **`ui.js`**: `setMode(mode)` — esconde `#board`, `#board-summary`, `#sprint-progress`, `#filter-row` em modo `'estudo'`; esconde `#study-panel` em modo `'tarefas'`. Atualiza texto (`'Modo Estudos'` / `'Modo Tarefas'`) e classe `header-action-btn--active` de `#mode-btn`. Função análoga a `showState` — não faz fetch, não faz parse, apenas alterna visibilidade.
- **`showState` (ui.js)**: adicionar `#mode-btn` ao bloco de hide inicial e ao bloco de show do estado `'success'`.
- **`app.js`**: após `showState('success')` em `handleSubmit`, chamar `setMode(localStorage.getItem('mode') || 'tarefas')`. Listener de `#mode-btn`: lê se `--active` está presente (= modo estudo), alterna, chama `setMode(newMode)`, persiste com `localStorage.setItem('mode', newMode)`. Adicionar `'mode'` em `STORAGE_KEYS` para que `resetAllSettings` limpe o modo salvo.
- **`index.html`**: `<button id="mode-btn" class="header-action-btn hidden">Modo Estudos</button>` como primeiro item de `.header-actions`.

**Edge case:** `setMode` é chamado APÓS `showState('success')` — ambos executam sincronicamente antes de qualquer repaint, então não há flash de ambos os painéis visíveis simultaneamente. Troca de modo não chama `handleSubmit` — os painéis já estão populados da última carga.

---
