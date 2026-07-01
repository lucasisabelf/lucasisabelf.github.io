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
