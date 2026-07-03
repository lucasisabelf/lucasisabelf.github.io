import { describe, it, expect } from 'vitest';
import { mapCardRow } from './mapCardRow';

describe('mapCardRow', () => {
  it('maps a full row into typed CardData', () => {
    const card = mapCardRow([
      'Título',
      'Descrição',
      '25/12/2026',
      'Alta',
      'Lucas',
      'https://example.com',
      'sprint, urgente',
    ]);
    expect(card).toEqual({
      title: 'Título',
      desc: 'Descrição',
      date: '25/12/2026',
      priority: 'Alta',
      responsavel: 'Lucas',
      link: 'https://example.com',
      tags: ['sprint', 'urgente'],
      recurrence: null,
    });
  });

  it('strips the recurrence marker and exposes it as a typed field', () => {
    const card = mapCardRow(['Título', 'Desc\n[repete:semanal]', '', '', '', '', '']);
    expect(card.desc).toBe('Desc');
    expect(card.recurrence).toBe('semanal');
  });

  it('discards a link that is not http(s)', () => {
    const card = mapCardRow(['Título', '', '', '', '', 'javascript:alert(1)', '']);
    expect(card.link).toBe('');
  });

  it('handles missing trailing columns gracefully', () => {
    const card = mapCardRow(['Só título']);
    expect(card.desc).toBe('');
    expect(card.tags).toEqual([]);
  });
});
