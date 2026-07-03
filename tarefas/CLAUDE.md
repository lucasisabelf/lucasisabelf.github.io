# Sprint Board — CLAUDE.md

## Visao geral

Aplicacao Kanban frontend-only que carrega tarefas de planilhas Google Sheets via endpoint `gviz/tq?out=csv`. Desde a migracao de 2026-07-03, e uma SPA React + TypeScript buildada com Vite, estilizada com Tailwind CSS v4 (`@tailwindcss/vite`). O codigo-fonte vive em `tarefas-app/` (irmao desta pasta); `tarefas/` e o **output de build**, o que o GitHub Pages efetivamente serve em `/tarefas/`.

## Estrutura

```
tarefas-app/                — codigo-fonte (nunca editar tarefas/*.js|css|index.html a mao)
  src/
    lib/                     — logica pura: parsing, formatacao, construcao de URL (sem DOM, sem React)
      exporters/             — um arquivo por formato de exportacao (csv, json, markdown, ics, whatsapp, calendar, askClaude)
    types/                   — interfaces TypeScript (ISP — ver secao propria)
    hooks/                   — estado + orquestracao (useSheetData, useActivityLog, useExtraLists, useSelection, useViewPreferences, useKeyboardShortcuts, ...)
    components/              — render puro, organizados por dominio (Card/, Board/, Header/, modals/, panels/)
    styles/theme.css         — variaveis de tema (`:root`/`[data-theme="dark"]`) + `@theme` do Tailwind
  vite.config.ts             — base:'/tarefas/', outDir:'../tarefas', emptyOutDir:false (ver nota abaixo)
  vitest roda testes unitarios/componentes junto do codigo (`*.test.ts(x)`)

tarefas/                     — OUTPUT DE BUILD (`npm run build` dentro de tarefas-app/)
  index.html, assets/*.js, assets/*.css   — gerados, nunca editados a mao
  FALHAS.md, FEATURES.md, CLAUDE.md, implements.md, .claude/   — arquivos de automacao/documentacao, FORA do build (emptyOutDir:false garante isso)
```

**Antes de qualquer feature:** editar sempre dentro de `tarefas-app/src/`, nunca os arquivos gerados em `tarefas/`. Ao terminar, rodar `npm run build` (dentro de `tarefas-app/`) para atualizar `tarefas/` antes de commitar — os dois devem sempre ir juntos no mesmo commit.

## Camadas e responsabilidades

| Camada | Onde vive | Responsabilidade |
|---|---|---|
| `lib/*.ts` | `src/lib/` | Funcoes puras — parsing de CSV/data/recorrencia/checklist, construcao de URLs, formatacao de texto. Sem `document`, sem `useState`. Testadas com Vitest. |
| `types/*.ts` | `src/types/` | Interfaces TypeScript, segregadas por papel de consumidor (ISP — ver abaixo). |
| `hooks/*.ts` | `src/hooks/` | Estado + orquestracao (fetch, localStorage, efeitos). Equivalente ao antigo `handleSubmit`/toggles de `app.js`, agora um hook por responsabilidade coesa. |
| `components/**` | `src/components/` | Render puro — recebem dados e handlers via props (tipados pelas interfaces de `types/`), nao chamam `fetch`/`localStorage` diretamente. |

## Single Responsibility via componentizacao

- Cada componente tem uma unica razao pra mudar: `Card` renderiza um card; `CardBadges` so os badges; `CardActions` so a barra de acoes; `DropdownMenu` so o padrao de menu suspenso (reusado por Compartilhar/Baixar/Visualizacao/"Mais" de cada card — nunca copiar esse padrao inline de novo, ver `DropdownMenu.tsx`).
- Logica de estado que nao e puramente de apresentacao vira um hook (`use*`), nunca fica dentro do componente de render. Um componente que faz fetch, gerencia `localStorage` E renderiza JSX ao mesmo tempo esta fazendo coisas demais — extrair o hook primeiro.
- `App.tsx` e a camada de orquestracao (equivalente ao antigo `handleSubmit`): conecta hooks a componentes, nao implementa logica de parsing/formatacao — isso vive em `lib/`.

## Interface Segregation (ISP)

Interfaces de props sao segregadas por papel de consumidor — nenhum componente recebe (ou depende de) um metodo que nao usa. Ver `src/types/handlers.ts` para o padrao de referencia:

- `CardData` — dado puro do card, sem nenhum comportamento.
- `CardSelectionHandlers` — so passada em modo selecao; sempre `Partial<>` nos componentes que a recebem.
- `CardActionHandlers` — so consumida por `CardActions` (Copiar/Duplicar/WhatsApp/Agenda/Perguntar ao Claude).
- `CardFilterHandlers` — so consumida por `CardBadges` (clique em prioridade/tag filtra o board).
- `CardDetailHandlers` — so consumida pelo titulo do card (abre modal de detalhe).

Ao adicionar uma nova acao/comportamento de card: **nao** adicionar mais um campo a uma interface generica de "props do card". Decidir quem realmente precisa do novo handler e adicionar (ou criar) a interface especifica daquele papel. O mesmo vale para os exportadores (`lib/exporters/*.ts`) — cada um exporta so a funcao do seu formato, nunca uma interface `BoardExporter` unica com todos os formatos.

## Convencoes de codigo

- **DRY**: 3 ocorrencias identicas justificam extracao, 2 nao (regra pratica ja usada nos ciclos anteriores). Um novo dropdown SEMPRE reusa `DropdownMenu`; um novo modal SEMPRE reusa `Modal`.
- **Sem `any`**: tipar com as interfaces de `types/` ou inferir; `unknown` + narrowing quando o formato de fato varia (ex: parsing de JSON de `localStorage`).
- **Sem comentarios obvios**: nome de funcao/variavel documenta o que ela faz; comentario so quando o *porque* nao e obvio (ex: por que `emptyOutDir: false`, por que um regex de marker de recorrencia usa `Object.keys` em vez de hardcode).
- **Sem abstracoes prematuras**: um hook so se justifica quando ha estado/efeito real pra extrair; um componente novo so se justifica quando ha responsabilidade de render propria.
- **Sem estado global mutavel fora de hooks**: nada de variavel de modulo mutavel; estado vive em `useState`/`useReducer` dentro de hooks, nunca em uma variavel `let` no topo de um arquivo.

## Fluxo principal

1. Usuario cola URL ou seleciona planilha pre-configurada (`SheetUrlForm`)
2. `App.tsx` chama `useSheetData().load(url)`
3. O hook extrai o ID (`lib/sheetUrl.ts`), busca as 3 abas em paralelo, cada resposta passa por `parseCsv` → `filterRows` → `mapCardRow` (`lib/`)
4. `App.tsx` encadeia `useActivityLog().track(columns)` e `useExtraLists().load(id)` com o resultado
5. `displayColumns` (filtro + ordenacao, via `useMemo`) e passado para `<Board>`, que renderiza `<Column>` → `<Card>`

## Testes

Vitest + Testing Library, colocados junto do codigo (`arquivo.ts` + `arquivo.test.ts`). Cobertura minima esperada pra codigo novo:

- Toda funcao pura em `lib/` com mais de um caminho logico (parsing, calculo de data/recorrencia, filtro/ordenacao) — testes de unidade.
- Componentes com comportamento interativo real (abre/fecha, chama handler) — pelo menos um teste de render + interacao (`@testing-library/user-event`).
- Rodar `npm test` (dentro de `tarefas-app/`) antes de considerar uma feature pronta.

## Build e deploy

`npm run build` (dentro de `tarefas-app/`) gera `tarefas/index.html` + `tarefas/assets/*`. **Nunca** rodar com `emptyOutDir: true` — `tarefas/` contem `FALHAS.md`/`FEATURES.md`/`CLAUDE.md`/`implements.md`/`.claude/`, que nao podem ser apagados pelo build. O deploy continua "GitHub Pages a partir da branch `main`" (sem Actions) — a raiz do repositorio (`lucasisabelf.github.io`) serve um site nao relacionado (TechEcode, dominio customizado via `CNAME`); qualquer mudanca de mecanismo de deploy afetaria os dois sites, por isso o build e commitado direto em vez de usar uma Action.

## Estilo com Tailwind CSS

### Decisao 2026-07-03 (substitui a de 2026-07-01): Tailwind v4 via `@tailwindcss/vite`

Com Node disponivel no ambiente onde `/dev-bat-loop` roda (instalado nesta sessao via `nvm`), a limitacao que motivou a decisao anterior deixou de existir. Migrado de CDN Play para o plugin oficial do Vite (`@tailwindcss/vite`), com o tema definido em `src/styles/theme.css` via `@theme` (mapeando as mesmas variaveis `--blue`/`--badge-bg`/etc., nao duplicando valores hex — mesmo principio da decisao anterior, agora em CSS nativo do Tailwind v4 em vez de `tailwind.config.js`). Elimina as duas limitacoes aceitas na decisao de CDN Play: compilacao em runtime no navegador e ausencia de purge de classes nao usadas.

### Decisao 2026-07-01 (historico, superada acima)

Adotado Tailwind CSS via CDN Play porque o ambiente de `/dev-bat-loop` nao tinha `node`/`npm`/`tailwindcss` disponiveis — um passo de build nao era executavel pelo pipeline automatico da epoca. Ver decisao acima para o estado atual.
