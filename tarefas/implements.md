## 1. Colapsar/expandir colunas

**Tarefa:** Clicar no header de uma coluna (`components/Board/Column.tsx`) recolhe/expande o corpo dela; atalho `C` recolhe/expande todas de uma vez. Estado persistido em `localStorage` via novo hook `hooks/useCollapseState.ts` (`collapsed`/`toggleColumn`/`toggleAll`). `HelpModal.tsx` ganhou a linha do atalho `C`.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 2. Copiar coluna via clique no header (texto/CSV)

**Tarefa:** Shift+clique no header copia a coluna como texto (`## Nome\n- título — desc`); Ctrl+Shift+clique copia como CSV. Implementado junto com a feature 1 porque as duas dividem o mesmo handler de clique no header (`handleHeaderClick` em `Column.tsx`, checando `e.shiftKey`/`e.ctrlKey` antes de decidir entre colapsar/copiar texto/copiar CSV).

**Edge case:** A descrição original propunha reaproveitar `buildCardRowCsv` (já usado por `buildBoardCsv` e por `handleDownloadCsvSelected`) — ao implementar, percebi que `handleDownloadCsvSelected` em `App.tsx` já duplicava o cabeçalho CSV como string literal inline (`'Coluna,Título,...'`), separado da constante `BOARD_CSV_HEADERS` privada de `lib/exporters/csv.ts`. Adicionar uma 3ª função de coluna com o mesmo cabeçalho hardcoded seria a 3ª ocorrência do mesmo literal.

**Solução:** Exportei `BOARD_CSV_HEADERS` de `csv.ts`, criei `buildColumnCsv(columnTitle, cards)` reaproveitando-a, e troquei o literal inline de `handleDownloadCsvSelected` pela constante importada — eliminando a duplicação em vez de criar uma terceira instância dela. `buildColumnText` (irmã de `buildBoardText`) também foi extraída via um `buildColumnLines` interno compartilhado em `markdown.ts`, evitando duplicar a construção de linhas entre as duas funções.

---

## 3. Restaurar o modo compacto

**Tarefa:** `view.compact` (já existia em `useViewPreferences.ts` e já persistia em `localStorage`) agora é de fato consumido: propagado por `Board.tsx` → `Column.tsx` → `Card.tsx` (prop `compact` nova, obrigatória nos três), escondendo descrição/checklist, `CardBadges`, o texto de "dias na coluna" e `CardActions` quando ativo. Título e badge "Novo" continuam visíveis.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 4. Debounce no filtro de texto

**Tarefa:** Novo hook genérico `hooks/useDebouncedValue.ts`; `App.tsx` mantém `query` (ligado ao campo de filtro, atualiza a cada tecla) e deriva `debouncedQuery` (200ms, `FILTER_DEBOUNCE_MS` nova em `lib/config.ts`) usado em `displayColumns` e na sincronização da URL (`?filter=`). Clique em badge de prioridade/tag e `Esc` continuam instantâneos, pois atuam sobre `query` diretamente.

**Edge case:** Nenhum.

**Solução:** N/A.

---

## 5. Consolidar ações de baixa frequência no mobile

**Tarefa:** `useMediaQuery(muiTheme.breakpoints.down('sm'))` decide, em `App.tsx`, se "Ir para planilha"/"Atividade"/"Selecionar" aparecem soltos (desktop, como já era) ou agrupados num `AppMenu` "Mais" (mobile), com contador de itens ativos no rótulo (`Mais (N)`, somando notificação de atividade não vista + modo de seleção ligado).

**Edge case:** A descrição original propunha um componente novo pro menu mobile; ao implementar, o `AppMenu` genérico (já existente desde a migração pro MUI, usado por Compartilhar/Baixar/Visualização/"Mais" de cada card) já cobria exatamente esse caso — seria a 5ª instância do padrão de dropdown.

**Solução:** Reaproveitei `AppMenu` diretamente em vez de criar um componente de menu mobile dedicado — nenhum componente novo foi necessário além da lógica condicional (`isMobile ? <AppMenu>...</AppMenu> : <>...botões soltos...</>`) dentro do próprio `App.tsx`.

---

## 6. Confirmação de "Limpar configurações" com Dialog do MUI

**Tarefa:** Novo componente genérico `components/ConfirmDialog.tsx` (title/message/confirmLabel como props) substitui o `window.confirm()` nativo em `handleResetSettings` (`App.tsx`). Segue o mesmo padrão de renderização condicional dos outros modais do projeto (`{resetConfirmOpen && <ConfirmDialog/>}`, sem prop `open` própria).

**Edge case:** Nenhum.

**Solução:** N/A.

---
