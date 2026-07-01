# Implements — Ciclo 29

## 1. Compartilhar tarefa via WhatsApp

**Tarefa:** A montagem de texto-resumo do card, antes só dentro do listener de `.card-copy-btn`, foi extraída para `buildCardSummaryText(title, desc, date, priority)` (`ui.js`, junto de `buildCalendarUrl`), reaproveitada por `.card-copy-btn` (atualizado) e pela nova `buildWhatsAppUrl(title, desc, date, priority)`. Novo botão `.card-action-btn.card-whatsapp-btn` em `renderCard`; o listener de delegação em `#board` (`app.js`) ganhou um ramo que chama `window.open(buildWhatsAppUrl(...))`.

**Edge case:** Nenhum — como já previsto em `FEATURES.md`, a ausência de um "arquivo nativo" de mensagem do WhatsApp (diferente do `.ics` do calendário) torna `window.open` a única opção real, sem violar a restrição `integracao-por-redirect` (que pressupõe a existência de um formato nativo alternativo).

**Solução:** N/A.

---

## 2. Feed de atividade recente

**Tarefa:** `trackColumnTime` (`app.js`) ganhou um terceiro item no retorno, `transitions` (`{ title, from, to }[]`), computado no mesmo laço que já monta `daysByTitle`/`newTitles` — só populado quando um título já existente no registro anterior mudou de coluna. Nova `logActivity(transitions)` acrescenta essas transições a um registro `activityLog` em `localStorage`, truncado às `ACTIVITY_LOG_LIMIT` (20) mais recentes. Nova `renderActivityFeed(log)` (`ui.js`) popula `#activity-feed-list` dentro do novo `#activity-panel` (`index.html`, reaproveitando `.study-panel`/`.study-panel-title`), alternado por um novo `#activity-btn` no header.

**Edge case:** Nenhum — o truncamento por contagem fixa (em vez de poda contra um conjunto "atual", como `columnEntryTimes` faz) já estava previsto em `FEATURES.md` como a abordagem correta para um log sem conjunto de referência.

**Solução:** N/A.

---

## 3. Distinguir planilha vazia de erro

**Tarefa:** `renderSummary` (`ui.js`) retorna cedo com uma mensagem orientativa ("Nenhuma tarefa encontrada — confira se os dados começam na linha 3 e se os nomes das abas conferem.") quando `total === 0`, em vez de montar o texto padrão de contagens.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Modo compacto esconde tags/checklist/selo novo

**Tarefa:** `.card-tags`, `.card-checklist`, `.card-checklist-progress` e `.card-new-badge` adicionados ao seletor combinado já existente `.board--compact .card-desc, .card-date, .card-priority, .card-actions { display: none; }` em `style.css`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 5. Contagem de itens em cada opção do modo

**Tarefa:** `populateModeSelect` (`ui.js`) passou a receber `{ name, count }[]` em vez de nomes simples; o texto de cada `<option>` vira `"Nome (N)"`, mantendo `option.value = name`. Em `handleSubmit` (`app.js`), a chamada passou a usar `extraLists.map(({ name, rows }) => ({ name, count: rows.length }))` — `listNames` (array de strings) permanece intocado nos demais usos (ex: validação de `mode` salvo).

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 6. Placeholder dinâmico no campo de busca

**Tarefa:** Em `handleSubmit` (`app.js`), após calcular `responsaveis`, verifica-se também `results.flat().some(r => r[6] && r[6].trim())` (alguma tarefa com tag) para decidir o `placeholder` de `#filter-input`: "Filtrar por título, responsável ou tag..." quando há responsáveis ou tags, "Filtrar tarefas..." caso contrário.

**Edge case:** Nenhum.

**Solução:** N/A.

---

**Nota do ciclo:** `APP_VERSION` incrementada de `1.27` para `1.28`. Primeiro ciclo sob a nova regra de esforço mínimo (`.claude/commands/features.md`): feature 1 é Média, feature 2 é Longa, as demais são Curtas. O Passo 0d encontrou uma sugestão externa nova (integração com WhatsApp) — passou no filtro de segurança e virou a feature 1.
