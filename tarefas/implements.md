# Implements — Sprint Board

## 1. Modal de detalhes do card ao clicar no título

**Tarefa:** Em `index.html`, adicionado `#card-detail-overlay` com modal contendo `#card-detail-title`, `#card-detail-desc`, `#card-detail-date`, `#card-detail-priority` e `#card-detail-close`. Em `ui.js`, adicionadas `openCardDetail(card)` (popula os campos de `card.dataset`, alterna `.hidden` nos campos opcionais, remove `.hidden` do overlay) e `closeCardDetail()` (adiciona `.hidden` ao overlay). Em `app.js`, delegação no `#board`: clique em `.card-title` chama `openCardDetail` antes de qualquer outro handler. Listeners para `#card-detail-close`, clique-fora no overlay, e `Escape` expandido para também chamar `closeCardDetail()`. Em `style.css`, adicionadas `.card-detail-desc` e `.card-detail-meta`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Shift+click no header copia a coluna como texto

**Tarefa:** No listener existente dos `.column-header` em `app.js`, verificação de `e.shiftKey`: se verdadeiro, constrói array de linhas com `## colName` e uma linha `- title — desc` por card (usando `card.dataset`), copia via `navigator.clipboard.writeText` e chama `flashButton(h, '✓ Copiado!')` no header. Se sem shift, comportamento original (colapso + `saveCollapseState`). Em `index.html`, adicionada linha `Shift+Header → Copiar coluna como texto` na tabela de atalhos.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Atalho P para imprimir

**Tarefa:** No handler `keydown` de `document` em `app.js`, dentro do bloco `boardVisible && !inInput`, adicionado `if (e.key === 'p' || e.key === 'P') window.print()`. Em `index.html`, adicionada linha `P → Imprimir board` na tabela de atalhos.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Scroll ao topo da coluna após renderização

**Tarefa:** Em `renderColumn` (ui.js), após `rows.forEach(row => body.appendChild(renderCard(row)))`, adicionado `body.scrollTop = 0`. Garante que sort e re-render sempre posicionam a coluna no início.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Rodapé com metadados no export de texto

**Tarefa:** Em `buildBoardText` (ui.js), após o loop de colunas, adicionado `lines.push('---\nExportado em ${ts}')` onde `ts` é `new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })`. O rodapé aparece tanto no "Exportar" (clipboard) quanto no "Baixar .md". `APP_VERSION` incrementada para `1.14`.

**Edge case:** Nenhum

**Solução:** N/A

---
