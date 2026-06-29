# Sprint Board — CLAUDE.md

## Visao geral

Aplicacao Kanban frontend-only que carrega tarefas de planilhas Google Sheets via endpoint `gviz/tq?out=csv`. Sem build tool, sem framework, sem dependencias — HTML + CSS + JS vanilla.

## Estrutura

```
index.html   — markup estatico (header, paineis de estado, board com 3 colunas)
style.css    — estilos (layout grid, cards, spinner, responsivo)
app.js       — toda a logica: config, parsing, fetch, render, eventos
```

## Arquitetura de app.js

O codigo segue camadas funcionais distintas — cada funcao tem uma unica responsabilidade:

| Funcao           | Responsabilidade                                      |
|------------------|-------------------------------------------------------|
| `extractSheetId` | Extrair ID da URL do Google Sheets                    |
| `buildSheetUrl`  | Montar URL do endpoint CSV por aba                    |
| `parseCsv`       | Converter texto CSV em matriz de strings              |
| `filterRows`     | Remover linhas vazias                                 |
| `renderCard`     | Criar elemento DOM de um card a partir de uma linha   |
| `renderColumn`   | Popular uma coluna com cards (ou estado vazio)        |
| `showState`      | Alternar visibilidade dos paineis de estado           |
| `handleSubmit`   | Orquestrar o fluxo completo de carregamento           |
| `populateSelect` | Popular o `<select>` de planilhas pre-configuradas    |

## Dados e configuracao

- `SHEET_NAMES` — nomes das abas do Google Sheets (ordem importa: mapeia 1:1 com colunas)
- `COLUMN_BODIES` — IDs dos elementos DOM de cada coluna (mesmo indice de `SHEET_NAMES`)
- `SHEETS_MAP` — planilhas pre-configuradas `{ nome: url }` (config de usuario, nao logica)

## Convencoes de codigo

- **DRY**: logica de construcao de URL, parsing de CSV e manipulacao de DOM nao se repetem. Extrair helper antes de duplicar.
- **Single Responsibility**: cada funcao faz uma coisa. Misturar fetch + parse + render em um lugar e violacao — isso vai para `handleSubmit` que orquestra, nao implementa.
- **Sem comentarios obvios**: o nome da funcao ja documenta o que ela faz.
- **Sem abstrações prematuras**: tres linhas similares nao justificam um helper. Quando virar quatro ou mais, extrai.
- **Sem estado global mutavel**: configuracao e constante; estado da UI e gerenciado via `showState`.

## Fluxo principal

1. Usuario cola URL ou seleciona planilha pre-configurada
2. `handleSubmit` extrai o ID, chama `showState('loading')`
3. Faz fetch paralelo das 3 abas com `Promise.all`
4. Cada resposta passa por `parseCsv` -> `filterRows`
5. `renderColumn` popula cada coluna com `renderCard` por linha
6. `showState('success')` exibe o board

## Convencoes HTML/CSS

- Classes de estado (`hidden`) controladas por JS — nao por inline style
- Colunas indexadas pelo mesmo array `COLUMN_BODIES` que o JS usa
- CSS usa variaveis de layout no `.board` (grid 3 colunas, responsivo em 768px)
- Cores de header de coluna: azul (todo), amarelo (progress), verde (done)
