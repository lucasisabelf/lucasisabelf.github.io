# Features Sugeridas — Sprint Board

Ordenadas por impacto × esforço (maior impacto, menor esforço primeiro).

---

## Colapsar/expandir colunas

**Categoria:** Funcional

**Esforço:** Média

**O que:** Clicar no header de uma coluna (`components/Board/Column.tsx`) recolhe/expande o corpo dela (esconde a lista de cards, mantém só o header visível). Atalho de teclado `C` recolhe/expande todas as colunas de uma vez. Estado persistido em `localStorage` por coluna (ex.: `collapseState`), restaurado ao carregar.

**Por que:** essa funcionalidade existia na versão vanilla (`toggleColumnCollapse`/`saveCollapseState`/`initCollapseState`, atalho `C` já documentado no modal de Ajuda atual — `HelpModal.tsx` não lista `C` porque a função nunca foi portada pra versão React) e não foi migrada. É útil quando uma coluna (geralmente "Done") acumula muitos itens e atrapalha a visão geral do sprint.

**Onde vive:** novo hook `hooks/useCollapseState.ts` (persistência em `localStorage`, análogo a `useViewPreferences.ts`) expondo `collapsed: Record<string, boolean>` e `toggleColumn(id)`/`toggleAll()`; `Column.tsx` recebe `collapsed`/`onToggleCollapse` e esconde o `Box` do corpo (não desmontar os cards, só ocultar, pra manter o estado de scroll/seleção); `App.tsx` liga o atalho `C` via `useKeyboardShortcuts` (novo campo `onToggleAllColumns`); `HelpModal.tsx` ganha a linha `C — Colapsar/expandir todas as colunas`.

**Edge case:** o clique no header não deve disparar quando o usuário está fazendo Shift+clique ou Ctrl+Shift+clique (ver feature seguinte, "Copiar coluna via header") — checar `e.shiftKey`/`e.ctrlKey` antes de alternar o colapso, mesma ordem de precedência que a versão vanilla já usava.

---

## Copiar coluna via clique no header (texto/CSV)

**Categoria:** Funcional

**Esforço:** Curta

**O que:** Shift+clique no header de uma coluna copia todos os cards visíveis dela como texto (`## Nome da coluna` + lista com `- título — descrição`); Ctrl+Shift+clique copia como linhas CSV. Mesmo padrão de feedback visual das outras ações de cópia do projeto (indicar sucesso brevemente no próprio header clicado).

**Por que:** também existia na versão vanilla (atalhos `Shift+Header`/`Ctrl+Shift+Header`, ainda documentados no modal de Ajuda atual) e não foi portada — hoje não há como copiar rapidamente só uma coluna sem usar o modo de seleção múltipla card a card.

**Onde vive:** handler de clique no header em `Column.tsx`, reutilizando `buildCardRowCsv` (`lib/exporters/csv.ts`, já usado por `buildBoardCsv` e pela cópia de selecionados — essa seria a 3ª chamada idêntica a essa função, então **não duplicar** a construção de linha CSV) para o modo CSV, e uma função nova `buildColumnText(columnTitle, cards)` em `lib/exporters/markdown.ts` (irmã de `buildBoardText`, mas para uma única coluna) para o modo texto.

**Edge case:** copiar deve considerar só os cards **visíveis** (após filtro atual), igual ao comportamento de `buildBoardCsv`/`buildBoardText` hoje — não os cards ocultos pelo filtro de texto/responsável.

---

## Restaurar o modo compacto

**Categoria:** Não Funcional

**Esforço:** Curta

**O que:** O toggle "Compacto" já existe no menu Visualização (`ViewToggles.tsx`, `view.compact` em `useViewPreferences.ts`) e persiste em `localStorage`, mas hoje **não tem nenhum efeito visual** — nenhum componente consome `compact` para de fato esconder descrição/checklist/badges/ações do card. Ligar o valor já existente à renderização real.

**Por que:** é uma regressão silenciosa da migração pra React — o estado é rastreado e o item de menu mostra "ativo" corretamente, mas o usuário que liga o toggle não vê nenhuma mudança no board, o que parece um bug (e é).

**Onde vive:** `Board.tsx` recebe `compact` (já é passado por `App.tsx`, só não é usado) e propaga pra `Column`/`Card`; `Card.tsx` ganha um prop `compact?: boolean` que, quando true, não renderiza checklist/descrição, `CardBadges` e `CardActions` (mesmo conjunto de elementos que a versão vanilla escondia via `.board--compact`).

**Edge case:** o título do card e o badge de "Novo" continuam visíveis mesmo em modo compacto — só o conteúdo secundário (descrição, badges de data/prioridade/tags, ações) some, igual ao comportamento original.

---

## Debounce no filtro de texto

**Categoria:** Não Funcional

**Esforço:** Curta

**O que:** O campo de filtro (`FilterBar.tsx`, `query` em `App.tsx`) hoje recalcula `filterCards`/`sortCards` (via `displayColumns`, `useMemo`) a cada tecla digitada, sem nenhum debounce. Adicionar um atraso curto (~200ms) antes de aplicar o filtro.

**Por que:** a versão vanilla tinha `FILTER_DEBOUNCE_MS` justamente pra isso; em planilhas grandes, recalcular filtro+ordenação a cada tecla é trabalho redundante — o usuário só se importa com o resultado final depois de parar de digitar.

**Onde vive:** novo hook `hooks/useDebouncedValue.ts` (genérico, reutilizável), usado em `App.tsx` entre o `query` "bruto" do input (atualizado a cada tecla, pra não travar a digitação) e o valor efetivamente passado pra `filterCards`.

**Edge case:** o clique num badge de prioridade/tag (`toggleQueryFilter`) e o atalho `Esc` de limpar filtro devem continuar instantâneos (sem debounce) — só a digitação livre no campo de texto é debounced.

---

## Consolidar ações de baixa frequência no mobile

**Categoria:** UI

**Esforço:** Longa

**O que:** No breakpoint `xs` (mobile, já tratado especialmente após o fix do header sticky), agrupar os botões "Atividade", "Selecionar" e "Ir para planilha" (hoje soltos lado a lado na `Stack` de controles em `App.tsx`) dentro de um menu "Mais ▾" usando o `AppMenu` já existente — no desktop (`md` e acima) eles continuam soltos como estão hoje.

**Por que:** o header já cresceu bastante (Compartilhar, Baixar, Visualização, Atividade, Selecionar, Ir para planilha, + Nova Tarefa) e o fix recente de responsividade (header não-sticky com scroll próprio no mobile) ajuda, mas não resolve a densidade de controles — no mobile, menos itens soltos = menos altura ocupada antes do board aparecer.

**Onde vive:** `App.tsx`, condicionando a renderização via `useMediaQuery(theme.breakpoints.down('sm'))` do MUI (padrão já usado em outros projetos MUI pra responsividade condicional em JS, complementar ao `sx` responsivo já usado no `AppBar`); os três botões passam a ser `children` de um único `AppMenu` quando `isMobile` é verdadeiro.

**Edge case:** o contador de não-vistos da Atividade (`activity.unseenCount`) e o estado ativo do modo de seleção (`selection.selectMode`) precisam continuar visíveis de alguma forma quando os itens estão dentro do menu — refletir no próprio rótulo do botão "Mais" (ex.: "Mais (1)"), no mesmo espírito do rótulo dinâmico que `ViewToggles` já usa pra "Visualização (N)".

---

## Confirmação de "Limpar configurações" com Dialog do MUI

**Categoria:** UX

**Esforço:** Curta

**O que:** Trocar o `window.confirm(...)` nativo (usado em `handleResetSettings`, `App.tsx`) por um `Dialog` de confirmação do MUI (`DialogTitle`/`DialogContent`/`DialogActions` com botões "Cancelar"/"Limpar", o segundo com `color="error"`), consistente com o resto dos modais do app.

**Por que:** `window.confirm()` é uma caixa de diálogo nativa do navegador, visualmente destoante de uma interface inteiramente MUI — quebra a consistência visual bem no momento de uma ação destrutiva (limpar todas as configurações), que é justamente quando clareza visual mais importa.

**Onde vive:** novo `ConfirmDialog` genérico e reutilizável em `components/` (título + mensagem + label do botão de confirmação como props), usado primeiro por `handleResetSettings`; `HelpModal.tsx` passa a abrir esse dialog em vez de chamar `onResetSettings` direto.

**Edge case:** como é a 1ª instância de "dialog de confirmação genérico" no projeto (`Dialog` hoje só aparece em `NewTaskModal`/`CardDetailModal`/`HelpModal`, cada um com conteúdo específico), não há ainda 3 ocorrências que justifiquem a extração por si só — mas como esse é exatamente o tipo de interação (confirmar/cancelar) que tende a se repetir (ex.: confirmar exclusão futura), vale já nascer como componente genérico em vez de inline dentro de `HelpModal`.

---
