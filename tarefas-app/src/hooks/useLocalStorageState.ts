import { useState } from 'react';

function readStoredBoolean(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === 'true';
}

/** Estado booleano persistido em localStorage — toggles de visualização (tema, compacto, etc). */
export function useLocalStorageBoolean(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(() => readStoredBoolean(key, fallback));

  function update(next: boolean) {
    setValue(next);
    localStorage.setItem(key, String(next));
  }

  return [value, update];
}

function readStoredString(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

export function useLocalStorageString(key: string, fallback: string): [string, (value: string) => void] {
  const [value, setValue] = useState(() => readStoredString(key, fallback));

  function update(next: string) {
    setValue(next);
    localStorage.setItem(key, next);
  }

  return [value, update];
}
