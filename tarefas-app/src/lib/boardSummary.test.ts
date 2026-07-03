import { describe, it, expect, vi } from 'vitest';
import { computeBoardSummary } from './boardSummary';
import type { CardData, ColumnData } from '../types/card';

function card(partial: Partial<CardData>): CardData {
  return { title: '', desc: '', date: '', priority: '', responsavel: '', link: '', tags: [], recurrence: null, ...partial };
}

describe('computeBoardSummary', () => {
  it('counts totals per column and priorities', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15));

    const columns: ColumnData[] = [
      { id: 'todo', title: 'To Do', cards: [card({ title: 'A', priority: 'Alta' })] },
      { id: 'progress', title: 'In Progress', cards: [card({ title: 'B', priority: 'Média' })] },
      { id: 'done', title: 'Done', cards: [card({ title: 'C' }), card({ title: 'D' })] },
    ];

    const summary = computeBoardSummary(columns);
    expect(summary.total).toBe(4);
    expect(summary.inProgress).toBe(1);
    expect(summary.done).toBe(2);
    expect(summary.priorityCounts.Alta).toBe(1);
    expect(summary.priorityCounts.Média).toBe(1);

    vi.useRealTimers();
  });

  it('counts overdue cards grouped by responsavel', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15));

    const columns: ColumnData[] = [
      { id: 'todo', title: 'To Do', cards: [card({ title: 'A', date: '01/01/2026', responsavel: 'Lucas' })] },
      { id: 'progress', title: 'In Progress', cards: [card({ title: 'B', date: '02/01/2026', responsavel: 'Lucas' })] },
      { id: 'done', title: 'Done', cards: [] },
    ];

    const summary = computeBoardSummary(columns);
    expect(summary.overdue).toBe(2);
    expect(summary.overdueByResponsavel).toEqual({ Lucas: 2 });

    vi.useRealTimers();
  });

  it('computes average days in progress from daysByTitle', () => {
    const columns: ColumnData[] = [
      { id: 'todo', title: 'To Do', cards: [] },
      { id: 'progress', title: 'In Progress', cards: [card({ title: 'A' }), card({ title: 'B' })] },
      { id: 'done', title: 'Done', cards: [] },
    ];
    const daysByTitle = new Map([['A', 2], ['B', 6]]);
    expect(computeBoardSummary(columns, daysByTitle).avgDaysInProgress).toBe(4);
  });

  it('returns null average when daysByTitle is not provided', () => {
    const columns: ColumnData[] = [{ id: 'progress', title: 'In Progress', cards: [card({ title: 'A' })] }];
    expect(computeBoardSummary(columns).avgDaysInProgress).toBeNull();
  });
});
