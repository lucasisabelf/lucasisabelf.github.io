# Implements — Sprint Board

## 1. Highlight de texto correspondente no filtro

**Tarefa:** Em `ui.js`, adicionado helper `markMatch(text, query)` que escapa `&`, `<`, `>` para HTML e envolve cada match case-insensitive de `query` em `<mark>` usando RegExp com flag `gi`. Em `filterCards`, quando card é visível e `q !== ''`, `.card-title.innerHTML` e `.card-desc.innerHTML` recebem o resultado de `markMatch` com o title/desc de `card.dataset`. Quando `q === ''` ou card é oculto, `.textContent` é restaurado de `card.dataset` para remover as marcações. Em `style.css`, declaradas `--mark-bg` e `--mark-color` em `:root` (amarelo/marrom) e `[data-theme="dark"]` (marrom escuro/âmbar claro), e regra `.card-title mark, .card-desc mark` com essas variáveis.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Mensagem "Sem resultados" por coluna ao filtrar

**Tarefa:** No final de `filterCards` em `ui.js`, após o loop de visibilidade, iteração de cada `.column-body`: se `cards.length > 0 && cards.every(c => c.classList.contains('hidden')) && q !== ''`, cria ou reusa `.filter-empty` com textContent `'Sem resultados'` e appenda ao body. Se a condição não é atendida, remove o elemento se existir. Em `style.css`, adicionada regra `.filter-empty` com `color: var(--text-muted)`, `font-size: .85rem`, `text-align: center`, `padding: 1rem 0`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 3. Botão "Copiar título" no card

**Tarefa:** Em `renderCard` (ui.js), adicionado `.card-copy-btn` com texto `'Copiar'` ao `.card-actions` após `.card-calendar-btn`. No listener de delegação em `#board` (app.js), adicionado handler para `.card-copy-btn`: `navigator.clipboard.writeText(card.dataset.title)` seguido de `flashButton(copyBtn, '✓ Copiado!')`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Contagem de prioridades no resumo do board

**Tarefa:** Em `ui.js`, adicionada `countByPriority(priority)` que retorna `document.querySelectorAll(\`.card:not(.hidden)[data-priority="${priority}"]\`).length`, espelhando o padrão de `countOverdue` e `countWarning`. Em `renderSummary`, após o bloco de warning, chamadas a `countByPriority('Alta')`, `countByPriority('Média')`, `countByPriority('Baixa')` e, se qualquer valor for positivo, acrescenta ` · Alta: X · Média: Y · Baixa: Z` ao texto do resumo.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Auto-incremento de `APP_VERSION` a cada ciclo

**Tarefa:** Em `config.js`, `APP_VERSION` incrementado de `'1.10'` para `'1.11'` como parte do ciclo dev-bat-loop. Esta ação ocorre antes do commit para que a versão publicada reflita o ciclo atual.

**Edge case:** Nenhum

**Solução:** N/A

---
