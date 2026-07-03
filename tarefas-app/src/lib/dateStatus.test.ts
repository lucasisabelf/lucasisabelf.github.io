import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDateInfo } from './dateStatus';

describe('getDateInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // 15/01/2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when there is no date', () => {
    expect(getDateInfo('')).toBeNull();
  });

  it('flags a past date as overdue and computes the overdue stage', () => {
    const info = getDateInfo('01/01/2026'); // 14 dias atrás
    expect(info?.status).toBe('overdue');
    expect(info?.overdueStage).toBe(4);
    expect(info?.text).toContain('há 14 dia');
  });

  it('flags today as today', () => {
    const info = getDateInfo('15/01/2026');
    expect(info?.status).toBe('today');
  });

  it('flags a near-future date within the warning window', () => {
    const info = getDateInfo('17/01/2026'); // +2 dias
    expect(info?.status).toBe('warning');
    expect(info?.text).toContain('em 2 dia');
  });

  it('treats a far-future date as normal (no warning)', () => {
    const info = getDateInfo('01/03/2026');
    expect(info?.status).toBe('normal');
  });

  it('flags an unparseable date as invalid', () => {
    const info = getDateInfo('data inválida');
    expect(info?.status).toBe('invalid');
    expect(info?.overdueStage).toBe(0);
  });
});
