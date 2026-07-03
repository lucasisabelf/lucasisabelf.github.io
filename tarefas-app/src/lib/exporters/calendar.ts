import { parsePtBrDate } from '../date';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function buildCalendarUrl(title: string, desc: string, dateStr: string): string {
  const d = parsePtBrDate(dateStr);
  const base = 'https://www.google.com/calendar/event?action=TEMPLATE';
  const params = `&text=${encodeURIComponent(title)}${desc ? '&details=' + encodeURIComponent(desc) : ''}`;
  const dates = d
    ? `&dates=${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}/${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    : '';
  return base + params + dates;
}
