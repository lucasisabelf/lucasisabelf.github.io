import { describe, it, expect } from 'vitest';
import { buildIcsContent, buildIcsCalendar } from './ics';

describe('buildIcsContent', () => {
  it('produces a single-event VCALENDAR with escaped text', () => {
    const ics = buildIcsContent('Tarefa; importante, urgente', 'linha1\nlinha2', '25/12/2026');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:Tarefa\\; importante\\, urgente');
    expect(ics).toContain('DESCRIPTION:linha1\\nlinha2');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261225');
    expect(ics).toContain('DTEND;VALUE=DATE:20261226');
  });
});

describe('buildIcsCalendar', () => {
  it('produces one VEVENT per card, all inside a single VCALENDAR', () => {
    const ics = buildIcsCalendar([
      { title: 'A', desc: '', date: '01/01/2026' },
      { title: 'B', desc: '', date: '02/01/2026' },
    ]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
  });
});
