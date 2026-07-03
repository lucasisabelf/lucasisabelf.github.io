import type { CardData } from '../types/card';

export function buildCardSummaryText(card: Pick<CardData, 'title' | 'desc' | 'date' | 'priority'>): string {
  const { title, desc, date, priority } = card;
  return `${title}${desc ? ' — ' + desc : ''}${date ? ' · ' + date : ''}${priority ? ' [' + priority + ']' : ''}`;
}
