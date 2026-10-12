import { describe, it, expect } from 'vitest';
import { moveCardBetweenColumns, parseDraggedCard, serializeDraggedCard } from './dragCard';
import type { CardData } from '../types/card';

function card(title: string, date = '01/01/2026'): CardData {
  return { title, desc: '', date, priority: '', responsavel: '', link: '', tags: [], recurrence: null };
}

const columns = [
  { id: 'todo', title: 'To Do', cards: [card('A'), card('B')] },
  { id: 'progress', title: 'In Progress', cards: [card('C')] },
  { id: 'done', title: 'Done', cards: [] },
];

describe('drag payload', () => {
  it('round-trips card and source column', () => {
    expect(parseDraggedCard(serializeDraggedCard(card('A'), 'todo'))).toEqual({ card: card('A'), fromColumnId: 'todo' });
  });

  it('rejects malformed payloads', () => {
    expect(parseDraggedCard('not json')).toBeNull();
    expect(parseDraggedCard('{"card":{"title":1},"fromColumnId":"todo"}')).toBeNull();
    expect(parseDraggedCard('{"fromColumnId":"todo"}')).toBeNull();
  });
});

describe('moveCardBetweenColumns', () => {
  it('moves the card to the end of the target column', () => {
    const result = moveCardBetweenColumns(columns, card('A'), 'todo', 'progress');
    expect(result[0].cards.map((c) => c.title)).toEqual(['B']);
    expect(result[1].cards.map((c) => c.title)).toEqual(['C', 'A']);
  });

  it('matches by title and date', () => {
    expect(moveCardBetweenColumns(columns, card('A', '02/02/2026'), 'todo', 'done')).toBe(columns);
  });

  it('is a no-op when dropping on the same column', () => {
    expect(moveCardBetweenColumns(columns, card('A'), 'todo', 'todo')).toBe(columns);
  });
});
