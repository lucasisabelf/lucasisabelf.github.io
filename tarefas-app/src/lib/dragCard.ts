import type { CardData } from '../types/card';

export const CARD_DRAG_MIME = 'application/x-sprint-card';

export interface DraggedCard {
  card: CardData;
  fromColumnId: string;
}

export function serializeDraggedCard(card: CardData, fromColumnId: string): string {
  return JSON.stringify({ card, fromColumnId });
}

export function parseDraggedCard(raw: string): DraggedCard | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('card' in parsed) || !('fromColumnId' in parsed)) return null;
    const { card, fromColumnId } = parsed;
    if (typeof fromColumnId !== 'string' || typeof card !== 'object' || card === null) return null;
    if (!('title' in card) || typeof card.title !== 'string' || !('date' in card) || typeof card.date !== 'string') return null;
    return { card: card as CardData, fromColumnId };
  } catch {
    return null;
  }
}

/** Remove o card da coluna de origem e o põe no fim da destino — espelha o que o Apps Script faz na planilha. */
export function moveCardBetweenColumns<T extends { id: string; cards: CardData[] }>(
  columns: T[],
  card: CardData,
  fromColumnId: string,
  toColumnId: string,
): T[] {
  const source = columns.find((c) => c.id === fromColumnId);
  const index = source?.cards.findIndex((c) => c.title === card.title && c.date === card.date) ?? -1;
  if (!source || index === -1 || fromColumnId === toColumnId) return columns;
  const moved = source.cards[index];
  return columns.map((col) => {
    if (col.id === fromColumnId) return { ...col, cards: col.cards.filter((_, i) => i !== index) };
    if (col.id === toColumnId) return { ...col, cards: [...col.cards, moved] };
    return col;
  });
}
