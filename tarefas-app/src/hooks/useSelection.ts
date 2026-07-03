import { useCallback, useState } from 'react';

export function useSelection() {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTitles, setSelectedTitles] = useState<Set<string>>(new Set());

  const toggleSelectMode = useCallback(() => {
    setSelectMode((mode) => {
      if (mode) setSelectedTitles(new Set());
      return !mode;
    });
  }, []);

  const toggleTitle = useCallback((title: string) => {
    setSelectedTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  const selectAll = useCallback((titles: string[]) => {
    setSelectedTitles(new Set(titles));
  }, []);

  const reset = useCallback(() => {
    setSelectMode(false);
    setSelectedTitles(new Set());
  }, []);

  return { selectMode, selectedTitles, toggleSelectMode, toggleTitle, selectAll, reset };
}
