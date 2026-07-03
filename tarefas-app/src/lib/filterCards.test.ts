import { describe, it, expect } from 'vitest';
import { filterCards } from './filterCards';
import type { CardData } from '../types/card';

function card(partial: Partial<CardData>): CardData {
  return { title: '', desc: '', date: '', priority: '', responsavel: '', link: '', tags: [], recurrence: null, ...partial };
}

const cards = [
  card({ title: 'Escrever testes', responsavel: 'Lucas', tags: ['sprint'] }),
  card({ title: 'Revisar PR', responsavel: 'Aline', priority: 'Alta' }),
];

describe('filterCards', () => {
  it('matches by title text, case-insensitive', () => {
    expect(filterCards(cards, 'testes', '').map((c) => c.title)).toEqual(['Escrever testes']);
  });

  it('matches by tag', () => {
    expect(filterCards(cards, 'sprint', '').map((c) => c.title)).toEqual(['Escrever testes']);
  });

  it('matches by priority', () => {
    expect(filterCards(cards, 'alta', '').map((c) => c.title)).toEqual(['Revisar PR']);
  });

  it('filters by responsavel exactly', () => {
    expect(filterCards(cards, '', 'Aline').map((c) => c.title)).toEqual(['Revisar PR']);
  });

  it('combines text query and responsavel filter', () => {
    expect(filterCards(cards, 'testes', 'Aline')).toEqual([]);
  });

  it('returns all cards for an empty query and no responsavel filter', () => {
    expect(filterCards(cards, '', '')).toHaveLength(2);
  });

  it('requires all whitespace-separated terms to match', () => {
    expect(filterCards(cards, 'escrever revisar', '')).toEqual([]);
  });
});
