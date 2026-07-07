import { useCallback, useState } from 'react';

function safeJsonParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Estado de colapso por coluna, persistido em localStorage — mesmo padrão da versão vanilla (`collapseState`). */
export function useCollapseState() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    safeJsonParse(localStorage.getItem('collapseState'), {}),
  );

  const toggleColumn = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('collapseState', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setCollapsed((prev) => {
      const allCollapsed = ids.every((id) => prev[id]);
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = !allCollapsed;
      });
      localStorage.setItem('collapseState', JSON.stringify(next));
      return next;
    });
  }, []);

  return { collapsed, toggleColumn, toggleAll };
}
