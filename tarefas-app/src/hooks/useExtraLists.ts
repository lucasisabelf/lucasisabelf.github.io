import { useCallback, useState } from 'react';
import { fetchListNames, fetchExtraList } from '../lib/extraLists';
import { mapListItemRow, type ListItemData } from '../lib/mapListItemRow';

export interface ExtraList {
  name: string;
  items: ListItemData[];
}

export function useExtraLists() {
  const [lists, setLists] = useState<ExtraList[]>([]);

  const load = useCallback(async (sheetId: string) => {
    const names = await fetchListNames(sheetId);
    const fetched = await Promise.all(
      names.map(async (name) => ({ name, items: (await fetchExtraList(sheetId, name)).map(mapListItemRow) })),
    );
    setLists(fetched);
  }, []);

  const reset = useCallback(() => setLists([]), []);

  return { lists, load, reset };
}
