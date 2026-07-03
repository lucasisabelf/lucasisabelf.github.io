import type { ChecklistItem } from '../types/card';

export function parseChecklist(desc: string | null | undefined): ChecklistItem[] | null {
  const items = (desc || '')
    .split('\n')
    .map((line) => line.match(/^-\s*\[([ xX])\]\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((match) => ({ done: match[1].toLowerCase() === 'x', text: match[2] }));
  return items.length ? items : null;
}
