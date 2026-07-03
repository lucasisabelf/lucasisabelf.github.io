import type { ColumnData } from '../../types/card';

export function buildBoardText(columns: ColumnData[]): string {
  const lines: string[] = [];
  columns.forEach((col) => {
    lines.push(`## ${col.title}`);
    if (col.cards.length === 0) {
      lines.push('_(vazio)_');
    } else {
      col.cards.forEach((card) => {
        lines.push(`- ${card.title}${card.desc ? ` — ${card.desc}` : ''}`);
      });
    }
    lines.push('');
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
