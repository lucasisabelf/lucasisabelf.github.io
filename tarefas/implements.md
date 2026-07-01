# Implements — Ciclo 19

## Fix #002. Lista de Estudos — validação de aba antes de exibir

**Tarefa:** Corrigido o `studyFetch` para detectar quando a API do Google Sheets retorna dados da aba errada (comportamento de fallback quando a aba "Lista de Estudos" não existe). A função agora inclui a linha de cabeçalho no range (`A1:E`), valida se `rows[0][0].toLowerCase() === 'nome'` e retorna `[]` se não bater.

**Edge case:** `filterRows` aceita qualquer linha com `row[0]` não-vazio — sem validação do cabeçalho, o cabeçalho 'nome' passaria pelo filtro junto com os dados. O `slice(1)` deve acontecer ANTES de `filterRows`.

**Solução:** Validação inserida em `studyFetch`: `if (!rows.length || rows[0][0].trim().toLowerCase() !== 'nome') return [];` seguido de `filterRows(rows.slice(1))`. Alterado `STUDY_RANGE` em `config.js` de `'A2:E'` para `'A1:E'`.

---

## 1. Modo Tarefas / Modo Estudos (SPA)

**Tarefa:** Implementado `setMode(mode)` em `ui.js` que alterna visibilidade mutuamente exclusiva entre o board Kanban (`#board`, `#board-summary`, `#sprint-progress`, `#filter-row`) e o painel de estudos (`#study-panel`). Botão `#mode-btn` adicionado como primeiro item de `.header-actions` em `index.html`, com texto e estado `--active` refletindo o modo atual. Modo persistido em `localStorage` e restaurado após cada carga via `setMode(localStorage.getItem('mode') || 'tarefas')` chamado em `handleSubmit` imediatamente após `showState('success')`. `showState` atualizado para incluir `#mode-btn` no bloco de hide e no bloco de show do estado `'success'`. `'mode'` adicionado a `STORAGE_KEYS`.

**Edge case:** `showState('success')` mostra todos os elementos de conteúdo (board + study panel). Sem `setMode` logo em seguida, ambos ficariam visíveis simultaneamente — violação do padrão SPA. Por executarem sincronicamente antes de qualquer repaint, a sequência `showState` → `setMode` não causa flash visível.

**Solução:** `setMode` adicionado em `ui.js` imediatamente após `showState` (mesma camada, responsabilidade exclusiva de visibilidade de modo). Não é chamado dentro de `handleSubmit` para fazer fetch — apenas alterna visibilidade. O listener do `#mode-btn` na seção de init de `app.js` lê o estado atual do botão (`--active` = modo estudo) para determinar o novo modo.

---
