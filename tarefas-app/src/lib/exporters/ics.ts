import { parsePtBrDate } from '../date';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function buildIcsEvent(title: string, desc: string, dateStr: string, uid: string): string[] {
  const d = parsePtBrDate(dateStr) || new Date();
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  const ymdn = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@app`,
    `DTSTART;VALUE=DATE:${ymd}`,
    `DTEND;VALUE=DATE:${ymdn}`,
    `SUMMARY:${escapeIcsText(title)}`,
    desc ? `DESCRIPTION:${escapeIcsText(desc)}` : null,
    'END:VEVENT',
  ].filter((line): line is string => line !== null);
}

export function buildIcsContent(title: string, desc: string, dateStr: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sprint Board//EN',
    ...buildIcsEvent(title, desc, dateStr, `sprint-board-${Date.now()}`),
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export interface IcsEventInput {
  title: string;
  desc: string;
  date: string;
}

export function buildIcsCalendar(events: IcsEventInput[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sprint Board//EN',
    ...events.flatMap((e, i) => buildIcsEvent(e.title, e.desc, e.date, `sprint-board-${Date.now()}-${i}`)),
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
