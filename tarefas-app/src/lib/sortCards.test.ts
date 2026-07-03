import { describe, it, expect } from 'vitest';
import { sortCards } from './sortCards';
import type { CardData } from '../types/card';

function card(partial: Partial<CardData>): CardData {
  return { title: '', desc: '', date: '', priority: '', responsavel: '', link: '', tags: [], recurrence: null, ...partial };
}

describe('sortCards', () => {
  const cards = [
    card({ title: 'B', priority: 'Baixa', date: '10/01/2026' }),
    card({ title: 'A', priority: 'Alta', date: '05/01/2026' }),
    card({ title: 'C', priority: 'Média', date: '01/01/2026' }),
  ];

  it('leaves order untouched for "original"', () => {
    expect(sortCards(cards, 'original').map((c) => c.title)).toEqual(['B', 'A', 'C']);
  });

  it('sorts by priority (Alta > Média > Baixa)', () => {
    expect(sortCards(cards, 'prioridade').map((c) => c.title)).toEqual(['A', 'C', 'B']);
  });

  it('sorts by date ascending, undated cards last', () => {
    const withUndated = [...cards, card({ title: 'D', date: '' })];
    expect(sortCards(withUndated, 'data').map((c) => c.title)).toEqual(['C', 'A', 'B', 'D']);
  });

  it('sorts alphabetically by title', () => {
    expect(sortCards(cards, 'titulo').map((c) => c.title)).toEqual(['A', 'B', 'C']);
  });

  it('does not mutate the original array', () => {
    const copy = [...cards];
    sortCards(cards, 'titulo');
    expect(cards).toEqual(copy);
  });
});
