import { SORT_MODES, type SortMode } from '../../lib/sortCards';

const TOGGLE_BASE = 'text-xs rounded px-2 py-1 border border-border-input';
const TOGGLE_ACTIVE = 'bg-blue text-white border-blue';

interface ViewTogglesProps {
  compact: boolean;
  onToggleCompact(): void;
  focus: boolean;
  onToggleFocus(): void;
  columnTimeVisible: boolean;
  onToggleColumnTime(): void;
  expandActions: boolean;
  onToggleExpandActions(): void;
  sortMode: SortMode;
  onSortModeChange(mode: SortMode): void;
}

const SORT_LABELS: Record<SortMode, string> = {
  original: 'Ordem original',
  prioridade: 'Ordenar por prioridade',
  data: 'Ordenar por data',
  titulo: 'Ordenar A-Z',
};

export function ViewToggles({
  compact,
  onToggleCompact,
  focus,
  onToggleFocus,
  columnTimeVisible,
  onToggleColumnTime,
  expandActions,
  onToggleExpandActions,
  sortMode,
  onSortModeChange,
}: ViewTogglesProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <select
        className="text-xs rounded px-2 py-1 border border-border-input bg-surface text-text"
        value={sortMode}
        onChange={(e) => onSortModeChange(e.target.value as SortMode)}
      >
        {SORT_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {SORT_LABELS[mode]}
          </option>
        ))}
      </select>
      <button type="button" className={`${TOGGLE_BASE} ${compact ? TOGGLE_ACTIVE : ''}`} onClick={onToggleCompact} title="Compacto (D)">
        Compacto
      </button>
      <button type="button" className={`${TOGGLE_BASE} ${focus ? TOGGLE_ACTIVE : ''}`} onClick={onToggleFocus}>
        Foco
      </button>
      <button type="button" className={`${TOGGLE_BASE} ${columnTimeVisible ? TOGGLE_ACTIVE : ''}`} onClick={onToggleColumnTime}>
        Tempo na coluna
      </button>
      <button type="button" className={`${TOGGLE_BASE} ${expandActions ? TOGGLE_ACTIVE : ''}`} onClick={onToggleExpandActions}>
        Ver todas as ações
      </button>
    </div>
  );
}
