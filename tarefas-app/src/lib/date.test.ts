import { describe, it, expect } from 'vitest';
import { parsePtBrDate, toIsoDate, toPtBrDate, dateToIso } from './date';

describe('parsePtBrDate', () => {
  it('parses a valid dd/mm/yyyy date', () => {
    const d = parsePtBrDate('25/12/2026');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(11);
    expect(d!.getDate()).toBe(25);
  });

  it('returns null for empty/missing input', () => {
    expect(parsePtBrDate('')).toBeNull();
    expect(parsePtBrDate(null)).toBeNull();
    expect(parsePtBrDate(undefined)).toBeNull();
  });

  it('returns null when the string is not in dd/mm/yyyy shape', () => {
    expect(parsePtBrDate('não é uma data')).toBeNull();
    expect(parsePtBrDate('2026-12-25')).toBeNull();
  });

  it('returns null when parts are non-numeric', () => {
    expect(parsePtBrDate('aa/bb/cccc')).toBeNull();
  });

  it('normalizes semantically-overflowing but numeric dates instead of rejecting them (native Date behavior, intentional)', () => {
    // 31/02 não existe — new Date já rola para o dia seguinte válido (03/03).
    // Isso é aceito conscientemente: só tratamos como inválido o que o Date nativo não consegue parsear.
    const d = parsePtBrDate('31/02/2026');
    expect(d).not.toBeNull();
    expect(d!.getMonth()).toBe(2);
    expect(d!.getDate()).toBe(3);
  });
});

describe('toIsoDate / toPtBrDate', () => {
  it('round-trips between pt-BR and ISO formats', () => {
    expect(toIsoDate('25/12/2026')).toBe('2026-12-25');
    expect(toPtBrDate('2026-12-25')).toBe('25/12/2026');
  });

  it('returns empty string for empty input', () => {
    expect(toIsoDate('')).toBe('');
    expect(toPtBrDate('')).toBe('');
  });
});

describe('dateToIso', () => {
  it('pads month and day to two digits', () => {
    expect(dateToIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
