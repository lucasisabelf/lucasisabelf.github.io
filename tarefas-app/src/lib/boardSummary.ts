import type { ColumnData, Priority } from '../types/card';
import { getDateInfo } from './dateStatus';

export interface BoardSummary {
  total: number;
  inProgress: number;
  done: number;
  overdue: number;
  overdueByResponsavel: Record<string, number>;
  warning: number;
  priorityCounts: Record<Priority, number>;
  avgDaysInProgress: number | null;
}

export function computeBoardSummary(columns: ColumnData[], daysByTitle?: Map<string, number>): BoardSummary {
  const total = columns.reduce((sum, c) => sum + c.cards.length, 0);
  const inProgress = columns.find((c) => c.id === 'progress')?.cards.length ?? 0;
  const done = columns.find((c) => c.id === 'done')?.cards.length ?? 0;

  let overdue = 0;
  let warning = 0;
  const overdueByResponsavel: Record<string, number> = {};
  const priorityCounts: Record<Priority, number> = { Alta: 0, Média: 0, Baixa: 0 };

  columns.forEach((col) =>
    col.cards.forEach((card) => {
      const info = getDateInfo(card.date);
      if (info?.status === 'overdue') {
        overdue++;
        if (card.responsavel) overdueByResponsavel[card.responsavel] = (overdueByResponsavel[card.responsavel] || 0) + 1;
      }
      if (info?.status === 'warning') warning++;
      if (card.priority) priorityCounts[card.priority] = (priorityCounts[card.priority] || 0) + 1;
    }),
  );

  const progressCards = columns.find((c) => c.id === 'progress')?.cards ?? [];
  const daysList = daysByTitle
    ? progressCards.map((c) => daysByTitle.get(c.title)).filter((d): d is number => d !== undefined)
    : [];
  const avgDaysInProgress = daysList.length ? Math.round(daysList.reduce((s, d) => s + d, 0) / daysList.length) : null;

  return { total, inProgress, done, overdue, overdueByResponsavel, warning, priorityCounts, avgDaysInProgress };
}
