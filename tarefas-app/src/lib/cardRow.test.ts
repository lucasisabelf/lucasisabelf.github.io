import { describe, it, expect } from 'vitest';
import { cardToRow, draftToCard, draftToTsv } from './cardRow';
import { mapCardRow } from './mapCardRow';
import type { CardData } from '../types/card';

const card: CardData = {
  title: 'Revisar backlog',
  desc: 'Olhar itens antigos',
  date: '15/10/2026',
  priority: 'Alta',
  responsavel: 'Lucas',
  link: 'https://example.com',
  tags: ['sprint', 'urgente'],
  recurrence: 'semanal',
};

describe('cardToRow', () => {
  it('round-trips through mapCardRow', () => {
    expect(mapCardRow(cardToRow(card))).toEqual(card);
  });

  it('embeds the recurrence marker in the description column', () => {
    expect(cardToRow(card)[1]).toBe('Olhar itens antigos\n[repete:semanal]');
  });

  it('leaves the description untouched without recurrence', () => {
    expect(cardToRow({ ...card, desc: '', recurrence: null })[1]).toBe('');
  });
});

describe('draftToCard', () => {
  const draft = { name: '  Nova  ', desc: 'd', date: '2026-10-20', priority: 'Baixa' as const, recurrence: '' as const };

  it('converts the ISO date and trims the name', () => {
    const result = draftToCard(draft);
    expect(result.title).toBe('Nova');
    expect(result.date).toBe('20/10/2026');
    expect(result.recurrence).toBeNull();
  });

  it('keeps fields the modal does not edit from the base card', () => {
    const result = draftToCard(draft, card);
    expect(result.responsavel).toBe('Lucas');
    expect(result.link).toBe('https://example.com');
    expect(result.tags).toEqual(['sprint', 'urgente']);
  });
});

describe('draftToTsv', () => {
  it('produces the 4 tab-separated columns used by the paste flow', () => {
    const tsv = draftToTsv({ name: 'X', desc: '', date: '2026-01-02', priority: 'Média', recurrence: 'mensal' });
    expect(tsv).toBe('X\t[repete:mensal]\t02/01/2026\tMédia');
  });
});
