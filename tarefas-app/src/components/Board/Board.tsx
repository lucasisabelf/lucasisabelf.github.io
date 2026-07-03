import type { ColumnData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardFilterHandlers, CardSelectionHandlers } from '../../types/handlers';
import { Column } from './Column';

interface BoardProps
  extends CardActionHandlers,
    CardFilterHandlers,
    CardDetailHandlers,
    Partial<CardSelectionHandlers> {
  columns: ColumnData[];
  expandActions: boolean;
  focus: boolean;
  readonly: boolean;
  activeFilter?: string;
  onCreateTask?: () => void;
  selectedTitles?: Set<string>;
  newTitles?: Set<string>;
  daysByTitle?: Map<string, number>;
}

export function Board({ columns, focus, ...rest }: BoardProps) {
  const visibleColumns = focus ? columns.filter((c) => c.id !== 'done') : columns;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {visibleColumns.map((col) => (
        <Column key={col.id} {...col} {...rest} />
      ))}
    </div>
  );
}
