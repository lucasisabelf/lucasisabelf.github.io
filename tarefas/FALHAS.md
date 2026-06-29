# Fila de Falhas — Sprint Board

Falhas reportadas para análise e resolução automática no ciclo `dev-bat-loop`.

**Statuses possíveis:** `aberto` · `em análise` · `não passou` · `passou`

---

## #001 — Google Agenda só redireciona, não cria tarefa

**O que:** O botão de Google Agenda abre o link mas apenas redireciona para o Google Agenda sem criar a tarefa de fato. O usuário sabe que existe um formato de arquivo que o Google Agenda consegue ler (ex: `.ics`) e quer tentar essa abordagem ou outra conhecida para que a tarefa seja criada automaticamente.

**Como resolvi:** Substituído `buildCalendarUrl` (que apenas redirecionava) por `buildIcsContent` (ui.js) + `downloadIcs` (app.js). O botão "+ Agenda" agora gera e baixa um arquivo `.ics` (iCalendar) com VEVENT contendo título, descrição e data como evento de dia inteiro. Ao abrir o arquivo, o Google Agenda (ou qualquer app de calendário) oferece a importação com um clique — nenhum redirecionamento, a tarefa é criada de fato. (aprendizado registrado em 2026-06-29)

**Status:** passou

---
