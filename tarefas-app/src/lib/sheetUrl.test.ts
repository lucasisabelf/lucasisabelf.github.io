import { describe, it, expect } from 'vitest';
import { extractSheetId, buildSheetUrl } from './sheetUrl';

describe('extractSheetId', () => {
  it('extracts the id from a standard share URL', () => {
    expect(
      extractSheetId('https://docs.google.com/spreadsheets/d/1pwp4yeXAGXXghSW_tR9gqeaDI0/edit?usp=sharing'),
    ).toBe('1pwp4yeXAGXXghSW_tR9gqeaDI0');
  });

  it('returns null for a URL without a spreadsheet id', () => {
    expect(extractSheetId('https://example.com/not-a-sheet')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractSheetId('')).toBeNull();
  });
});

describe('buildSheetUrl', () => {
  it('builds a gviz csv export URL with the given range and sheet name', () => {
    const url = buildSheetUrl('abc123', 'To Do', 'A3:G');
    expect(url).toBe(
      'https://docs.google.com/spreadsheets/d/abc123/gviz/tq?tqx=out:csv&headers=0&range=A3:G&sheet=To%20Do',
    );
  });

  it('defaults to BOARD_RANGE when no range is given', () => {
    const url = buildSheetUrl('abc123', 'Done');
    expect(url).toContain('range=A3:G');
  });
});
