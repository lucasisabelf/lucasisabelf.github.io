import { useCallback, useState } from 'react';

function safeJsonParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useRecentSheets() {
  const [recent, setRecent] = useState<string[]>(() => safeJsonParse(localStorage.getItem('recentSheets'), []));

  const save = useCallback((url: string) => {
    setRecent((list) => {
      const updated = [url, ...list.filter((u) => u !== url)].slice(0, 5);
      localStorage.setItem('recentSheets', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recent, save };
}
