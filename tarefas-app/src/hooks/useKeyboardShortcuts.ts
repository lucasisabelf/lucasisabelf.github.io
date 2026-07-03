import { useEffect } from 'react';

export interface KeyboardShortcutHandlers {
  boardVisible: boolean;
  onRefresh(): void;
  onFocusFilter(): void;
  onNewTask(): void;
  onToggleCompact(): void;
  onToggleTheme(): void;
  onCycleSort(): void;
  onToggleSelectMode(): void;
  onToggleHelp(): void;
  onEscape(): void;
  onPrint(): void;
}

/** Atalhos globais do board — espelha os já documentados no modal de Ajuda da versão vanilla. */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === 'Escape') {
        handlers.onEscape();
        return;
      }
      if (e.key === '?') {
        handlers.onToggleHelp();
        return;
      }
      if (!handlers.boardVisible || inInput) return;

      switch (e.key.toLowerCase()) {
        case 'r':
          handlers.onRefresh();
          break;
        case 'f':
          handlers.onFocusFilter();
          break;
        case 'n':
          handlers.onNewTask();
          break;
        case 'd':
          handlers.onToggleCompact();
          break;
        case 't':
          handlers.onToggleTheme();
          break;
        case 's':
          handlers.onCycleSort();
          break;
        case 'v':
          handlers.onToggleSelectMode();
          break;
        case 'p':
          handlers.onPrint();
          break;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
