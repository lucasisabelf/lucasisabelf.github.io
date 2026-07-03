import { useCallback, useState } from 'react';
import type { ColumnData } from '../types/card';
import { SHEET_NAMES, COLUMN_IDS } from '../lib/config';
import { extractSheetId, buildSheetUrl, fetchWithTimeout } from '../lib/sheetUrl';
import { parseCsv, filterRows } from '../lib/csv';
import { mapCardRow } from '../lib/mapCardRow';

export type BoardState = 'idle' | 'loading' | 'success' | 'error';

async function fetchColumnRows(sheetId: string, sheetName: string): Promise<string[][]> {
  const url = buildSheetUrl(sheetId, sheetName);
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('A planilha retornou HTML. Verifique se ela está compartilhada como "Qualquer pessoa com o link pode ver".');
  }
  const text = await res.text();
  return filterRows(parseCsv(text));
}

export function useSheetData() {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [state, setState] = useState<BoardState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [sheetId, setSheetId] = useState<string | null>(null);

  const load = useCallback(async (sheetUrl: string) => {
    const id = extractSheetId(sheetUrl);
    if (!id) {
      setState('error');
      setErrorMessage('URL inválida. Cole o link de compartilhamento do Google Sheets.');
      return null;
    }

    setState('loading');
    try {
      const results = await Promise.all(SHEET_NAMES.map((name) => fetchColumnRows(id, name)));
      const newColumns: ColumnData[] = results.map((rows, i) => ({
        id: COLUMN_IDS[i],
        title: SHEET_NAMES[i],
        cards: rows.map(mapCardRow),
      }));
      setColumns(newColumns);
      setSheetId(id);
      setState('success');
      return { id, columns: newColumns };
    } catch (err) {
      setState('error');
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage('A planilha demorou demais para responder. Verifique sua conexão e tente novamente.');
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : 'Erro ao carregar a planilha. Verifique a URL e a visibilidade da planilha.',
        );
      }
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setColumns([]);
    setErrorMessage('');
    setSheetId(null);
  }, []);

  return { columns, state, errorMessage, sheetId, load, reset };
}
