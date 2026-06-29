# Implements — Sprint Board

## 1. Contador de dias até/desde o vencimento no badge de data

**Tarefa:** Constante `MS_PER_DAY = 86400000` declarada no topo de `ui.js`. Em `renderCard`, após aplicar a classe de data, calcula `delta = Math.round((parsed - today) / MS_PER_DAY)`. Se `delta > 0`, acrescenta ` · em N dia(s)` ao `dt.textContent`; se `delta < 0`, ` · há N dia(s)`. O bloco `if (parsed) dt.title = ...` foi fundido ao mesmo condicional. Dia atual (delta === 0) não recebe sufixo — o badge verde já sinaliza.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Modo "Foco" — esconder coluna Done

**Tarefa:** `let focusMode = false` adicionado ao topo de `app.js` junto dos outros estados de UI. `'focusMode'` adicionado a `STORAGE_KEYS`. `#focus-btn` adicionado ao HTML nas `.header-actions`. Em `showState` (ui.js), `focus-btn` adicionado ao conjunto hide-all e show-on-success. Listener `click` em `#focus-btn`: alterna `focusMode`, aplica `.hidden` em `#col-done`, alterna `.header-action-btn--active` e persiste em `localStorage`. Restauração via `localStorage.getItem('focusMode') === 'true'` na seção de init: aplica `.hidden` em `col-done` e a classe ativa no botão.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Exportar board como CSV

**Tarefa:** Em `app.js`, adicionado helper `csvEscape(str)` que envolve campos com vírgula, aspas ou quebra em aspas duplas (escapando aspas internas com `""`). `buildBoardCsv()` gera linha de header `Coluna,Título,Descrição,Data,Prioridade` e uma linha por card, lendo do DOM via `card.dataset` com nome de coluna obtido do `.column-header` sem o count `(N)`. `downloadBoardCsv()` cria Blob com BOM UTF-8 (`'﻿'`) para compatibilidade com Excel, tipo `text/csv;charset=utf-8`, download `sprint-board.csv`. `#csv-btn` adicionado ao HTML; visibilidade gerenciada por `showState`; listener registrado na seção de init.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Atalhos de teclado D (compacto) e T (tema)

**Tarefa:** No handler `keydown` de `document` em `app.js`, dentro do bloco `boardVisible && !inInput`, adicionados: `D`/`d` → `compact-btn.click()` e `T`/`t` → `theme-toggle.click()`. Em `index.html`, adicionadas duas linhas à tabela de atalhos no `#help-overlay`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Sincronização do filtro ativo na URL

**Tarefa:** Adicionado `updateUrlParam(key, value)` em `app.js`: usa `URLSearchParams`, faz `set`/`delete` e retorna URL com `params.toString()` (compatível com todos browsers). Nos três pontos onde o filtro é limpo (listener `filter-clear-btn`, Escape key, listener `filter-input`), chamada a `history.replaceState(null, '', updateUrlParam('filter', valor))`. Na seção de init, `handleSubmit()` é encadeado com `.then()` para restaurar `?filter=` da URL: popula `filter-input`, chama `filterCards`, exibe `filter-count` e `filter-clear-btn`. `APP_VERSION` incrementada de `1.11` para `1.12`.

**Edge case:** `params.size` não suportado em browsers antigos — corrigido usando `params.toString()` como guard.

**Solução:** Substituído `params.size ? '?' + params : ''` por `const qs = params.toString(); qs ? '?' + qs : ''`.

---
