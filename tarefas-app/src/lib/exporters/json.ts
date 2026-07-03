import type { ColumnData } from '../../types/card';

export function buildBoardJson(columns: ColumnData[]): Record<string, unknown[]> {
  const board: Record<string, unknown[]> = {};
  columns.forEach((col) => {
    board[col.title] = col.cards.map((card) => ({
      title: card.title,
      desc: card.desc,
      date: card.date,
      priority: card.priority,
      responsavel: card.responsavel,
      link: card.link,
      tags: card.tags.join(','),
    }));
  });
  return board;
}
