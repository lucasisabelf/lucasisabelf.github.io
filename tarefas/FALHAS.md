# Fila de Falhas — Sprint Board

Falhas reportadas para análise e resolução automática no ciclo `dev-bat-loop`.

**Statuses possíveis:** `aberto` · `em análise` · `não passou` · `passou`

---

## #001 — Google Agenda só redireciona, não cria tarefa

**O que:** O botão de Google Agenda abre o link mas apenas redireciona para o Google Agenda sem criar a tarefa de fato. O usuário sabe que existe um formato do whatsapp que cria evento tente essa abordagem.

**Como resolvi:** Segunda tentativa (após .ics falhar): abordagem combinada — ao clicar "+ Agenda", o botão agora simultaneamente (1) baixa o arquivo `.ics` via `downloadIcs` para dispositivos que abrem o app de calendário ao receber o arquivo, e (2) abre `https://www.google.com/calendar/event?action=TEMPLATE&...` em nova aba via `window.open` para quem prefere o fluxo web do Google Agenda. `buildCalendarUrl` adicionado em `ui.js` (junto de `buildIcsContent` e `parsePtBrDate`). O formato `action=TEMPLATE` é o usado por convites de calendário padrão (inclusive os compartilhados via WhatsApp). (aprendizado registrado em 2026-06-29)

**Status:** passou

---
