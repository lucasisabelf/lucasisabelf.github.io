import type { CardData } from '../types/card';

export function filterCards(cards: CardData[], query: string, responsavelFilter: string): CardData[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return cards.filter((card) => {
    const combined = `${card.title} ${card.desc} ${card.priority} ${card.responsavel} ${card.tags.join(' ')}`.toLowerCase();
    const matchesQuery = terms.length === 0 || terms.every((t) => combined.includes(t));
    const matchesResponsavel = !responsavelFilter || card.responsavel === responsavelFilter;
    return matchesQuery && matchesResponsavel;
  });
}
