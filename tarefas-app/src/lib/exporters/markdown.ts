import type { CardData, ColumnData } from '../../types/card';

function buildColumnLines(title: string, cards: CardData[]): string[] {
  const lines = [`## ${title}`];
  if (cards.length === 0) {
    lines.push('_(vazio)_');
  } else {
    cards.forEach((card) => {
      lines.push(`- ${card.title}${card.desc ? ` — ${card.desc}` : ''}`);
    });
  }
  return lines;
}

export function buildBoardText(columns: ColumnData[]): string {
  const lines: string[] = [];
  columns.forEach((col) => {
    lines.push(...buildColumnLines(col.title, col.cards), '');
  });
  const ts = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`---\nExportado em ${ts}`);
  return lines.join('\n').trim();
}

export function buildColumnText(columnTitle: string, cards: CardData[]): string {
  return buildColumnLines(columnTitle, cards).join('\n');
}
