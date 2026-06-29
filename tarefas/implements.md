# Implements — Sprint Board (ciclo 15)

## 1. Download .ics para criar evento no Google Agenda

**Tarefa:** Adicionado `buildIcsContent(title, desc, dateStr)` em `ui.js` — retorna string VCALENDAR/VEVENT com DTSTART/DTEND como datas de dia inteiro (VALUE=DATE), SUMMARY e DESCRIPTION opcionais, UID único por timestamp. Adicionado `downloadIcs(title, desc, dateStr)` em `app.js` — cria Blob `text/calendar`, ancora temporária e faz download `tarefa.ics`. No board delegation de `app.js`, substituído `window.open(buildCalendarUrl(...))` por `downloadIcs(...)`. Removida `buildCalendarUrl`.

**Edge case:** Nenhum

**Solução:** N/A

---

## 2. Filtro multi-termo com AND por espaço

**Tarefa:** Em `ui.js`, substituído `markMatch` por dois helpers: `markTerms(text, terms)` (escapa HTML uma vez e aplica regex de cada termo sequencialmente) e `markMatch(text, query)` que delega para `markTerms([query])`. Reescrito `filterCards` para dividir a query em `terms` via `/\s+/`, verificar visibilidade com `terms.every(t => combined.includes(t))` e usar `markTerms` para highlight de todos os termos.

**Edge case:** `markMatch` precisou ser refatorado para evitar re-escape de HTML ao aplicar múltiplos termos sequencialmente.

**Solução:** Introduzido `markTerms` como primitivo que faz o escape uma vez; `markMatch` vira wrapper de um termo só — nenhuma quebra de API existente.

---

## 3. Atalho E para exportar board como texto

**Tarefa:** No handler `keydown` de `document` em `app.js`, adicionado `if (e.key === 'e' || e.key === 'E') exportBoardText()` dentro do bloco `boardVisible && !inInput`. Em `index.html`, adicionada linha `E → Exportar board (copiar como texto)` na tabela de atalhos.

**Edge case:** Nenhum

**Solução:** N/A

---

## 4. Alta prioridade no título da aba

**Tarefa:** Em `renderSummary` (ui.js), atualizado `document.title` para `⚠ ${alta} · Sprint Board · ${pct}%` quando `alta > 0`, mantendo o formato original nos outros casos.

**Edge case:** Nenhum

**Solução:** N/A

---

## 5. Copiar card completo com metadados

**Tarefa:** No handler `.card-copy-btn` do board delegation em `app.js`, destruturado `{ title, desc, date, priority }` do `card.dataset` e construída string `${title}${desc ? ' — ' + desc : ''}${date ? ' · ' + date : ''}${priority ? ' [' + priority + ']' : ''}`. Campos opcionais omitidos quando vazios.

**Edge case:** Nenhum

**Solução:** N/A

---
