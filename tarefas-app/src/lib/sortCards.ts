import type { CardData } from '../types/card';
import { parsePtBrDate } from './date';

const PRIORITY_ORDER: Record<string, number> = { Alta: 0, Média: 1, Baixa: 2 };

export type SortMode = 'original' | 'prioridade' | 'data' | 'titulo';
export const SORT_MODES: SortMode[] = ['original', 'prioridade', 'data', 'titulo'];

function compareByDate(a: CardData, b: CardData): number {
  const da = parsePtBrDate(a.date);
  const db = parsePtBrDate(b.date);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da.getTime() - db.getTime();
}

export function sortCards(cards: CardData[], mode: SortMode): CardData[] {
  if (mode === 'prioridade') {
    return [...cards].sort(
      (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3) || compareByDate(a, b),
    );
  }
  if (mode === 'data') return [...cards].sort(compareByDate);
  if (mode === 'titulo') return [...cards].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  return cards;
}
