import type { CardData } from '../../types/card';
import { buildCardSummaryText } from '../format';

export function buildWhatsAppUrl(card: Pick<CardData, 'title' | 'desc' | 'date' | 'priority'>): string {
  return `https://wa.me/?text=${encodeURIComponent(buildCardSummaryText(card))}`;
}

export function buildBoardWhatsAppUrl(boardLink: string): string {
  return `https://wa.me/?text=${encodeURIComponent(boardLink)}`;
}
