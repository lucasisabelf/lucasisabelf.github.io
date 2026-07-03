export const FETCH_TIMEOUT_MS = 10000;
export const BOARD_RANGE = 'A3:G';

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function buildSheetUrl(id: string, sheetName: string, range: string = BOARD_RANGE): string {
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=0&range=${range}&sheet=${encodeURIComponent(sheetName)}`;
}

async function attemptFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Tenta duas vezes antes de propagar o erro — planilhas do Google às vezes falham a primeira tentativa a frio. */
export async function fetchWithTimeout(url: string): Promise<Response> {
  try {
    return await attemptFetch(url);
  } catch {
    return attemptFetch(url);
  }
}
