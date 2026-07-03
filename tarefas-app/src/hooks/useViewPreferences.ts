import { useLocalStorageBoolean } from './useLocalStorageState';

/** Toggles de visualização do board — cada um persistido isoladamente, igual ao padrão da versão vanilla. */
export function useViewPreferences() {
  const [compact, setCompact] = useLocalStorageBoolean('compactMode', false);
  const [focus, setFocus] = useLocalStorageBoolean('focusMode', false);
  const [columnTimeVisible, setColumnTimeVisible] = useLocalStorageBoolean('columnTimeVisible', true);
  const [expandActions, setExpandActions] = useLocalStorageBoolean('expandActionsMode', false);

  const activeCount = [compact, focus, columnTimeVisible, expandActions].filter(Boolean).length;

  return {
    compact,
    setCompact,
    focus,
    setFocus,
    columnTimeVisible,
    setColumnTimeVisible,
    expandActions,
    setExpandActions,
    activeCount,
  };
}
