import type { CardData, ColumnData } from '../../types/card';
import { csvEscape } from '../csv';

const BOARD_CSV_HEADERS = 'Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags';

export function buildCardRowCsv(card: CardData, colName: string): string {
  return [
    colName,
    card.title,
    card.desc,
    card.date,
    card.priority,
    card.responsavel,
    card.link,
    card.tags.join(','),
  ]
    .map(csvEscape)
    .join(',');
}

export function buildBoardCsv(columns: ColumnData[]): string {
  const rows = [BOARD_CSV_HEADERS];
  columns.forEach((col) => {
    col.cards.forEach((card) => rows.push(buildCardRowCsv(card, col.title)));
  });
  return rows.join('\n');
}

export function buildTemplateCsv(headers: string[]): string {
  return headers.map(csvEscape).join(',');
}
