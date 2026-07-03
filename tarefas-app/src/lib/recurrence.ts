import type { RecurrenceType } from '../types/card';
import { parsePtBrDate, dateToIso } from './date';

export const RECURRENCE_OPTIONS: Record<RecurrenceType, { label: string; badge: string }> = {
  semanal: { label: 'Semanalmente', badge: '🔁 Semanal' },
  mensal: { label: 'Mensalmente', badge: '🔁 Mensal' },
};

const RECURRENCE_MARKER_RE = new RegExp(
  `\\n?\\[repete:(${Object.keys(RECURRENCE_OPTIONS).join('|')})\\]$`,
);

export function buildRecurrenceMarker(type: RecurrenceType): string {
  return `[repete:${type}]`;
}

export function parseRecurrence(desc: string | null | undefined): RecurrenceType | null {
  const match = (desc || '').match(RECURRENCE_MARKER_RE);
  return match ? (match[1] as RecurrenceType) : null;
}

export function stripRecurrenceMarker(desc: string | null | undefined): string {
  return (desc || '').replace(RECURRENCE_MARKER_RE, '');
}

/** Próxima ocorrência de uma tarefa recorrente, pronta pra um <input type="date"> (yyyy-MM-dd). */
export function nextRecurrenceDate(ptBrDate: string, type: RecurrenceType): string {
  const parsed = parsePtBrDate(ptBrDate);
  if (!parsed) return '';
  const next = new Date(parsed);
  if (type === 'semanal') next.setDate(next.getDate() + 7);
  else if (type === 'mensal') next.setMonth(next.getMonth() + 1);
  return dateToIso(next);
}
