# Fila de Falhas — Sprint Board

Falhas reportadas para análise e resolução automática no ciclo `dev-bat-loop`.

**Statuses possíveis:** `aberto` · `em análise` · `não passou` · `passou`

---

## #001 — Google Agenda só redireciona, não cria tarefa

**O que:** O botão de Google Agenda abre o link mas apenas redireciona para o Google Agenda sem criar a tarefa de fato. O usuário sabe que existe um formato do whatsapp que cria evento tente essa abordagem.

**Como resolvi:** Segunda tentativa (após .ics falhar): abordagem combinada — ao clicar "+ Agenda", o botão agora simultaneamente (1) baixa o arquivo `.ics` via `downloadIcs` para dispositivos que abrem o app de calendário ao receber o arquivo, e (2) abre `https://www.google.com/calendar/event?action=TEMPLATE&...` em nova aba via `window.open` para quem prefere o fluxo web do Google Agenda. `buildCalendarUrl` adicionado em `ui.js` (junto de `buildIcsContent` e `parsePtBrDate`). O formato `action=TEMPLATE` é o usado por convites de calendário padrão (inclusive os compartilhados via WhatsApp). (aprendizado registrado em 2026-06-29)

**Status:** finalizado funcionou

---

## #002 — Lista de Estudos carrega dados da aba errada

**O que:** Ao carregar a planilha, a seção "Lista de Estudos" exibe os dados da primeira aba da planilha em vez da aba chamada "Lista de Estudos". A causa provável é que a aba "Lista de Estudos" não existe na planilha do usuário — quando a aba não existe, a API do Google Sheets retorna os dados da primeira aba por padrão, sem erro mas a lista deveria estar zerada nesse edge case.

**Como resolvi:** Alterado `STUDY_RANGE` de `'A2:E'` para `'A1:E'` para incluir a linha de cabeçalho no fetch. Em `studyFetch` (app.js), após `parseCsv`, valida-se que `rows[0][0].trim().toLowerCase() === 'nome'` antes de prosseguir — se a aba não existe, a API retorna dados da primeira aba cujo cabeçalho é diferente de 'nome', e `studyFetch` retorna `[]` imediatamente. Se válido, `rows.slice(1)` descarta o cabeçalho e `filterRows` processa os dados. (aprendizado registrado em 2026-06-30)

**Status:** finalizado funcionou

---

## #003 — Baixar modelo .csv gera apenas modelo de tarefas

**O que:** O botão "Baixar modelo .csv" gera sempre o CSV com os cabeçalhos do board de tarefas (Título, Descrição, Data, Prioridade). Não existe opção para baixar o modelo da Lista de Estudos (nome, topico, prioridade, status, motivo). O usuário precisa de um select para escolher qual modelo deseja baixar antes de clicar no botão.

**Como resolvi:** Adicionado `<select id="template-select">` com opções "Tarefas" e "Lista extra" ao lado de `#template-btn` em `index.html`. `TEMPLATE_CONFIG` (novo, em `config.js`) mapeia cada tipo a `{ headers, filename }`, reaproveitando `TEMPLATE_HEADERS` (schema de tarefas) e a nova constante `EXTRA_LIST_TEMPLATE_HEADERS` (schema de 5 colunas — nome/tópico/prioridade/status/motivo — o mesmo já usado por qualquer lista extra dinâmica desde a generalização da feature de listas 1:N deste ciclo, não mais só "Lista de Estudos"). `buildTemplateCsv` passou a receber `headers` por parâmetro em vez de ler `TEMPLATE_HEADERS` fixo; `downloadTemplateCsv` lê `document.getElementById('template-select').value`, resolve `{ headers, filename }` via `TEMPLATE_CONFIG[type]` e monta o blob/nome de arquivo dinamicamente. `showState` atualizado para mostrar/esconder `#template-select` junto de `#template-btn`. (aprendizado registrado em 2026-06-30)

**Status:** passou

---

## #004 — Botão "+" não faz nada, causando perda de funcionalidades

**O que:** O botão "mais" é o botão ao lado do copiar em cada tarefa, não faz nada quando clicado. O usuário relata que isso está fazendo perder várias funcionalidades.

**Como resolvi:** Primeira tentativa (incorreta): confundi "botão mais" com o "+" do header (`#new-task-btn`) e corrigi um bug real mas não relacionado nele (`addEventListener('click', openNewTaskModal)` recebia o `MouseEvent` como `prefill` — corrigido para `() => openNewTaskModal()`, mantido pois é uma correção válida por si só). O usuário esclareceu que "mais" é o botão **"Mais ▾"** de cada card (`.card-more-btn`, ao lado de "Copiar"), que abre um painel com "Sugerir ao Claude"/"+ Agenda"/"WhatsApp"/"Duplicar" — o que explica "perco várias funcionalidades" (as 4 de uma vez). Causa real: `.card-more-panel` tem `position: absolute; top: 100%` (via `.export-menu-panel`), mas seu pai direto `.card-actions` não tem `position: relative` — então o painel se posiciona relativo ao `.card` inteiro (o ancestral posicionado mais próximo), não ao botão "Mais ▾", renderizando fora do lugar esperado e sendo cortado pelo `overflow-y: auto` de `.column-body` na maioria dos casos, dando a impressão de que o clique "não faz nada". Corrigido envolvendo `.card-more-btn` + `.card-more-panel` em um wrapper `.card-more-menu` (`renderCard` em `ui.js`) com `position: relative` — mesmo padrão já usado e funcional em `.export-menu` (menus Baixar/Compartilhar/Visualização do header). `.card-more-menu` adicionado à regra `.export-menu { position: relative; display: inline-block; }` em `style.css` (seletor combinado, reaproveitando a regra existente). (aprendizado registrado em 2026-07-03)

**Status:** passou

---
