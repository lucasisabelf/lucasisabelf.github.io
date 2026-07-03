export function parsePtBrDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  return isNaN(d.getTime()) ? null : d;
}

export function toIsoDate(ptBrDate: string | null | undefined): string {
  const [d, m, y] = (ptBrDate || '').split('/');
  return d && m && y ? `${y}-${m}-${d}` : '';
}

export function toPtBrDate(isoDate: string | null | undefined): string {
  return isoDate ? isoDate.split('-').reverse().join('/') : '';
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Formata um Date como yyyy-MM-dd, pronto para um <input type="date">. */
export function dateToIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
