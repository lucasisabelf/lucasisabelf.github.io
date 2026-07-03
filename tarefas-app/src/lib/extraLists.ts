import { LISTS_SHEET_NAME, LISTS_RANGE, LISTS_HEADER, EXTRA_LIST_RANGE, EXTRA_LIST_HEADER } from './config';
import { buildSheetUrl, fetchWithTimeout } from './sheetUrl';
import { parseCsv, filterRows } from './csv';

export interface ExtraListData {
  name: string;
  rows: string[][];
}

export async function fetchListNames(sheetId: string): Promise<string[]> {
  try {
    const url = buildSheetUrl(sheetId, LISTS_SHEET_NAME, LISTS_RANGE);
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    if ((res.headers.get('content-type') || '').includes('text/html')) return [];
    const rows = parseCsv(await res.text());
    if (!rows.length || rows[0][0].trim().toLowerCase() !== LISTS_HEADER) return [];
    return filterRows(rows.slice(1)).map((r) => r[0].trim());
  } catch {
    return [];
  }
}

export async function fetchExtraList(sheetId: string, sheetName: string): Promise<string[][]> {
  try {
    const url = buildSheetUrl(sheetId, sheetName, EXTRA_LIST_RANGE);
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    if ((res.headers.get('content-type') || '').includes('text/html')) return [];
    const rows = parseCsv(await res.text());
    if (!rows.length || rows[0][0].trim().toLowerCase() !== EXTRA_LIST_HEADER) return [];
    return filterRows(rows.slice(1));
  } catch {
    return [];
  }
}
