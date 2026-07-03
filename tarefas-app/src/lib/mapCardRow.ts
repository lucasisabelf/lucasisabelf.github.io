import type { CardData } from '../types/card';
import { parseRecurrence, stripRecurrenceMarker } from './recurrence';

/** Converte uma linha crua da planilha (A3:G) em CardData tipado. */
export function mapCardRow(row: string[]): CardData {
  const title = (row[0] || '').trim();
  const rawDesc = (row[1] || '').trim();
  const recurrence = parseRecurrence(rawDesc);
  const desc = stripRecurrenceMarker(rawDesc);
  const date = (row[2] || '').trim();
  const priority = (row[3] || '').trim() as CardData['priority'];
  const responsavel = (row[4] || '').trim();
  const linkRaw = (row[5] || '').trim();
  const link = /^https?:\/\//i.test(linkRaw) ? linkRaw : '';
  const tags = (row[6] || '')
    .trim()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return { title, desc, date, priority, responsavel, link, tags, recurrence };
}
