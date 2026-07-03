# Features Sugeridas — Sprint Board

Ordenadas por impacto × esforço (maior impacto, menor esforço primeiro).

---

## Compartilhar board via WhatsApp

**Categoria:** Funcional

**Esforço:** Curta

**O que:** Adicionar botão "WhatsApp" dentro do `#share-menu-panel` (ao lado de "Copiar link do board"/"Copiar URL") que abre `https://wa.me/?text=` com o link do board (mesma URL que `copyBoardLink` já copia) codificado via `encodeURIComponent`.

**Por que:** sugestão externa via invertexto.com/matuto, filtrada em 2026-07-03 — pedia integração de compartilhamento via WhatsApp "semelhante ao que cardápios online fazem" (link com texto pré-preenchido). O projeto já tem esse padrão implementado por card individual (`buildWhatsAppUrl`/`card-whatsapp-btn`), mas não para o board inteiro.

**Onde vive:** novo botão `#whatsapp-share-btn` em `index.html` dentro de `#share-menu-panel`; listener em `app.js` junto de `copy-link-btn`/`copy-sheet-btn`; a URL do board é a mesma já usada em `copyBoardLink()` (não recalcular — reaproveitar a mesma construção de link).

**Edge case:** se o board ainda não foi carregado, o botão vive dentro do mesmo grupo de controles que `showState` já esconde fora do estado `success` — nenhum tratamento extra necessário além de seguir esse padrão já existente.

---

## Recorrência de tarefas

**Categoria:** Funcional

**Esforço:** Longa

**O que:** Adicionar campo "Repetir" (select: Nunca / Semanalmente / Mensalmente) no modal de nova tarefa (`#new-task-overlay`). Uma tarefa marcada como recorrente carrega um marcador de recorrência (ex.: sufixo `[repete:semanal]` na descrição) que `renderCard` reconhece para exibir um badge "🔁 Semanal"/"🔁 Mensal" no card. Ao duplicar essa tarefa via `card-duplicate-btn`, a data pré-preenchida no modal (`openNewTaskModal({...})`) passa a ser calculada automaticamente como a próxima ocorrência (data atual + intervalo), em vez de repetir a mesma data da tarefa original.

**Por que:** hoje recriar uma tarefa recorrente exige que o usuário calcule manualmente a próxima data e duplique a tarefa a cada ciclo; um mecanismo de recorrência elimina esse atrito repetitivo (tarefas semanais de sprint, reuniões recorrentes).

**Onde vive:** `#task-recurrence` (novo `<select>`) em `index.html` dentro do modal; `RECURRENCE_INTERVALS` (nova constante) no topo de `app.js` junto das demais constantes de configuração; parsing do marcador de recorrência e badge em `renderCard` (`ui.js`); função nova `nextRecurrenceDate(dateStr, intervalo)` em `app.js`, chamada pelo listener de `card-duplicate-btn`.

**Edge case:** para "mensal", usar `Date.setMonth` (não soma fixa de dias) — a API nativa já normaliza meses de tamanhos diferentes, não implementar cálculo de dias manual. O parsing/formatação de datas deve reutilizar `parsePtBrDate`/`toPtBrDate` já existentes, nunca `new Date(str)` direto.

---

## Validação defensiva de datas malformadas

**Categoria:** Não Funcional

**Esforço:** Curta

**O que:** Quando `parsePtBrDate` recebe uma data em formato inválido (célula da planilha preenchida errado, ex.: "31/02/2026" ou texto livre), o cálculo de "dias na coluna"/"atrasado" deve tratar o resultado como "sem data" (sem badge de atraso) em vez de propagar `NaN`/`Invalid Date`.

**Por que:** hoje uma célula de data malformada quebra silenciosamente o badge de "dias na coluna"/"atrasado" (mostra `NaN dias` ou marca atraso por engano) sem indicar que o dado de origem está errado — resiliência a dado malformado é a categoria que o projeto já reconhece como padrão (ex.: Fix #002).

**Onde vive:** `parsePtBrDate` em `ui.js` — validar com `Number.isNaN` sobre o resultado de `new Date(...)` e retornar `null` em vez de uma `Date` inválida; TODOS os call sites de `parsePtBrDate` no projeto (não só os mais óbvios) precisam checar esse `null` antes de calcular diferença de dias.

**Edge case:** uma data válida mas fora do intervalo esperado do sprint (ex.: ano 1900 digitado por engano) não é "inválida" para `Date` — só tratar como malformada os formatos que o `Date` nativo realmente não consegue parsear.

---

## Foco de teclado nos modais

**Categoria:** Não Funcional

**Esforço:** Média

**O que:** Ao abrir `#new-task-overlay` ou `#card-detail-overlay`, prender o foco de Tab dentro do modal (focus trap) e fechar com a tecla `Esc`, devolvendo o foco ao elemento que abriu o modal ao fechar.

**Por que:** acessibilidade — hoje o Tab escapa do modal para elementos do board atrás dele, e não há atalho `Esc` consistente para fechar (só clique fora/botão cancelar), quebrando a navegação por teclado.

**Onde vive:** função `trapFocus(overlayEl)` nova em `ui.js`, chamada por `openNewTaskModal`/`openCardDetail`; listener de `Esc` registrado uma vez na inicialização de `app.js` (não dentro de `handleSubmit`), checando qual overlay está visível.

**Edge case:** se mais de um overlay estiver visível ao mesmo tempo, `Esc` fecha apenas o que está no topo — não fechar todos de uma vez.

---

## Consolidar controles de baixa frequência em menu "Mais"

**Categoria:** UI

**Esforço:** Longa

**O que:** Mover `#activity-btn` ("Atividade"), `#select-mode-btn` ("Selecionar") e `#reset-btn` do header principal para dentro de um novo menu dropdown "Mais ▾" (`#more-menu-btn`/`#more-menu-panel`), seguindo o mesmo padrão dos menus já existentes (Baixar, Compartilhar, Visualização) via `setupDropdownMenu`.

**Por que:** o header já acumulou 20 controles soltos (problema já registrado em `features.md`); esses três são os de uso menos frequente e são candidatos naturais a consolidação, reduzindo a largura do header sem remover funcionalidade.

**Onde vive:** novo grupo `<div class="export-menu">` em `index.html` contendo os 3 botões movidos; `setupDropdownMenu('more-menu-btn', 'more-menu-panel')` reaproveitado em `app.js` (4ª instância do padrão — reaproveitar a função existente, não duplicar a lógica de toggle); `showState` (`ui.js`) atualizado para mostrar/esconder `#more-menu-btn` junto dos demais controles do estado `success`.

**Edge case:** `#select-mode-btn` mantém o estado visual `header-action-btn--active` quando `selectMode` está ativo; esse indicador deve continuar visível no próprio `#more-menu-btn` (ex.: rótulo "Mais (1)") quando o painel está fechado, no mesmo espírito de `updateViewMenuLabel`.

---

## Banner persistente de instrução após criar tarefa

**Categoria:** UX

**Esforço:** Média

**O que:** Depois que `submitNewTask()` copia o TSV da nova tarefa para a área de transferência e abre a planilha em nova aba, exibir um banner persistente no board (além do texto de 1s dentro do modal que já fecha) do tipo "📋 Copiado! Cole (Ctrl+V) na aba correspondente da planilha para confirmar a tarefa", com um botão "Ok, entendi" para dispensar.

**Por que:** o fluxo atual de criação de tarefa é indireto (copia para clipboard + abre a planilha, espera colagem manual) e o único aviso disso (`#modal-feedback`) some em 1 segundo, justo quando a nova aba rouba o foco — o usuário facilmente perde a instrução e acha que "não aconteceu nada", a mesma confusão relatada em FALHAS.md #004.

**Onde vive:** elemento `#paste-hint-banner` (novo, `hidden` por padrão) em `index.html`, próximo de `#board-summary`; exibido por `submitNewTask` em `app.js`; dispensado pelo botão próprio ou automaticamente na próxima chamada de `showState` (reaproveitar esse reset centralizado, não criar um segundo caminho).

**Edge case:** se o usuário criar uma segunda tarefa antes de dispensar o banner da primeira, o banner deve apenas atualizar o texto (não empilhar dois banners) — um único elemento reutilizado, não uma lista.

---
