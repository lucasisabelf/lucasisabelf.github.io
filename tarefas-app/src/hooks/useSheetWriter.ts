import { useCallback, useState } from 'react';
import type { CardData } from '../types/card';
import { postSheetAction, type SheetWriteAction } from '../lib/sheetWriter';
import { cardToRow } from '../lib/cardRow';
import { listItemToRow, type ListItemData } from '../lib/mapListItemRow';

const STORAGE_KEY = 'writeEndpoints';

function readEndpoints(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (typeof parsed !== 'object' || parsed === null) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  } catch {
    return {};
  }
}

function matchOf(card: CardData) {
  return { title: card.title, date: card.date };
}

/** URL do Web App (Apps Script) por planilha + operações de escrita. `onWritten` recarrega o board após cada sucesso. */
export function useSheetWriter(sheetId: string | null, onWritten: () => void) {
  const [endpoints, setEndpoints] = useState(readEndpoints);
  const [pending, setPending] = useState(false);
  const endpoint = sheetId ? endpoints[sheetId] ?? '' : '';

  const setEndpoint = useCallback(
    (url: string) => {
      if (!sheetId) return;
      setEndpoints((current) => {
        const next = { ...current };
        if (url) next[sheetId] = url;
        else delete next[sheetId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [sheetId],
  );

  const run = useCallback(
    async (payload: SheetWriteAction) => {
      if (!endpoint) throw new Error('Edição direta não configurada para esta planilha.');
      setPending(true);
      try {
        await postSheetAction(endpoint, payload);
        onWritten();
      } finally {
        setPending(false);
      }
    },
    [endpoint, onWritten],
  );

  return {
    configured: Boolean(endpoint),
    endpoint,
    pending,
    setEndpoint,
    createTask: (sheet: string, card: CardData) => run({ action: 'create', sheet, row: cardToRow(card) }),
    updateTask: (sheet: string, original: CardData, updated: CardData) =>
      run({ action: 'update', sheet, match: matchOf(original), row: cardToRow(updated) }),
    moveTask: (from: string, to: string, card: CardData) => run({ action: 'move', from, to, match: matchOf(card) }),
    deleteTask: (sheet: string, card: CardData) => run({ action: 'delete', sheet, match: matchOf(card) }),
    createListItem: (list: string, item: ListItemData) => run({ action: 'create', kind: 'list', sheet: list, row: listItemToRow(item) }),
    updateListItem: (list: string, original: ListItemData, updated: ListItemData) =>
      run({ action: 'update', kind: 'list', sheet: list, match: { title: original.nome }, row: listItemToRow(updated) }),
    deleteListItem: (list: string, item: ListItemData) => run({ action: 'delete', kind: 'list', sheet: list, match: { title: item.nome } }),
  };
}
