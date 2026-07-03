import { describe, it, expect } from 'vitest';
import { parseRecurrence, stripRecurrenceMarker, buildRecurrenceMarker, nextRecurrenceDate } from './recurrence';

describe('recurrence marker parsing', () => {
  it('detects a weekly marker at the end of the description', () => {
    expect(parseRecurrence('Revisar backlog\n[repete:semanal]')).toBe('semanal');
  });

  it('detects a monthly marker', () => {
    expect(parseRecurrence('Fechar folha\n[repete:mensal]')).toBe('mensal');
  });

  it('returns null when there is no marker', () => {
    expect(parseRecurrence('Descrição comum')).toBeNull();
    expect(parseRecurrence('')).toBeNull();
  });

  it('strips the marker, leaving the clean description', () => {
    expect(stripRecurrenceMarker('Revisar backlog\n[repete:semanal]')).toBe('Revisar backlog');
  });

  it('leaves description untouched when there is no marker', () => {
    expect(stripRecurrenceMarker('sem marcador')).toBe('sem marcador');
  });

  it('builds the marker in the exact format the parser expects', () => {
    expect(parseRecurrence(buildRecurrenceMarker('semanal'))).toBe('semanal');
  });
});

describe('nextRecurrenceDate', () => {
  it('advances a weekly recurrence by 7 days', () => {
    expect(nextRecurrenceDate('01/01/2026', 'semanal')).toBe('2026-01-08');
  });

  it('advances a monthly recurrence by one month using native Date normalization', () => {
    expect(nextRecurrenceDate('31/01/2026', 'mensal')).toBe('2026-03-03');
  });

  it('returns empty string for an unparseable date', () => {
    expect(nextRecurrenceDate('', 'semanal')).toBe('');
  });
});
