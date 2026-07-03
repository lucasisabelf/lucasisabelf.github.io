import { describe, it, expect } from 'vitest';
import { parseCsv, filterRows, csvEscape } from './csv';

describe('parseCsv', () => {
  it('parses simple rows', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields with embedded commas', () => {
    expect(parseCsv('"a,b",c')).toEqual([['a,b', 'c']]);
  });

  it('handles escaped quotes inside quoted fields', () => {
    expect(parseCsv('"say ""hi""",c')).toEqual([['say "hi"', 'c']]);
  });

  it('handles quoted fields with embedded newlines', () => {
    expect(parseCsv('"line1\nline2",c')).toEqual([['line1\nline2', 'c']]);
  });
});

describe('filterRows', () => {
  it('drops rows with empty first column', () => {
    expect(filterRows([['a'], [''], ['  '], ['b']])).toEqual([['a'], ['b']]);
  });
});

describe('csvEscape', () => {
  it('quotes fields containing commas, quotes or newlines', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('a"b')).toBe('"a""b"');
    expect(csvEscape('a\nb')).toBe('"a\nb"');
  });

  it('leaves plain fields untouched', () => {
    expect(csvEscape('plain')).toBe('plain');
  });

  it('treats null/undefined as empty string', () => {
    expect(csvEscape(undefined)).toBe('');
    expect(csvEscape(null)).toBe('');
  });
});
