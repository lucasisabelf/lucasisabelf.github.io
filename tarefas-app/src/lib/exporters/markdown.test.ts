import { describe, it, expect } from 'vitest';
import { buildBoardText, buildColumnText } from './markdown';
import type { CardData, ColumnData } from '../../types/card';

function card(partial: Partial<CardData>): CardData {
  return { title: '', desc: '', date: '', priority: '', responsavel: '', link: '', tags: [], recurrence: null, ...partial };
}

describe('buildColumnText', () => {
  it('lists cards with title and description', () => {
    const text = buildColumnText('To Do', [card({ title: 'A', desc: 'desc A' }), card({ title: 'B' })]);
    expect(text).toBe('## To Do\n- A — desc A\n- B');
  });

  it('shows a placeholder for an empty column', () => {
    expect(buildColumnText('Done', [])).toBe('## Done\n_(vazio)_');
  });
});

describe('buildBoardText', () => {
  it('concatenates all columns with a footer timestamp', () => {
    const columns: ColumnData[] = [
      { id: 'todo', title: 'To Do', cards: [card({ title: 'A' })] },
      { id: 'done', title: 'Done', cards: [] },
    ];
    const text = buildBoardText(columns);
    expect(text).toContain('## To Do\n- A');
    expect(text).toContain('## Done\n_(vazio)_');
    expect(text).toContain('Exportado em');
  });
});
