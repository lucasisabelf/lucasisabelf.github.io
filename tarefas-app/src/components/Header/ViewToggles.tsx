import { DropdownMenu } from '../DropdownMenu';
import { SORT_MODES, type SortMode } from '../../lib/sortCards';

const ITEM_CLASS = 'link-btn text-left p-1.5';

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

function activeClass(active: boolean) {
  return `${ITEM_CLASS} ${active ? 'link-btn--active' : ''}`;
}

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
  const activeCount = [compact, focus, columnTimeVisible, expandActions].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="field-input px-2.5 py-1.5 text-[0.85rem] cursor-pointer"
        title="Ciclar ordenação (S)"
        value={sortMode}
        onChange={(e) => onSortModeChange(e.target.value as SortMode)}
      >
        {SORT_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {SORT_LABELS[mode]}
          </option>
        ))}
      </select>
      <DropdownMenu label={`Visualização${activeCount > 0 ? ` (${activeCount})` : ''} ▾`} buttonClassName="link-btn">
        <button type="button" className={activeClass(compact)} onClick={onToggleCompact} title="Compacto (D)">
          Compacto
        </button>
        <button type="button" className={activeClass(focus)} onClick={onToggleFocus}>
          Foco
        </button>
        <button type="button" className={activeClass(columnTimeVisible)} onClick={onToggleColumnTime}>
          Tempo na coluna
        </button>
        <button type="button" className={activeClass(expandActions)} onClick={onToggleExpandActions}>
          Ver todas as ações
        </button>
      </DropdownMenu>
    </div>
  );
}
