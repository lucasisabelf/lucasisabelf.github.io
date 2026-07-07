import Grid from '@mui/material/Grid';
import type { ColumnData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardFilterHandlers, CardSelectionHandlers, ColumnHeaderHandlers } from '../../types/handlers';
import { Column } from './Column';

interface BoardProps
  extends CardActionHandlers,
    CardFilterHandlers,
    CardDetailHandlers,
    ColumnHeaderHandlers,
    Partial<CardSelectionHandlers> {
  columns: ColumnData[];
  expandActions: boolean;
  focus: boolean;
  compact: boolean;
  readonly: boolean;
  activeFilter?: string;
  collapsedColumns?: Record<string, boolean>;
  onCreateTask?: () => void;
  selectedTitles?: Set<string>;
  newTitles?: Set<string>;
  daysByTitle?: Map<string, number>;
}

export function Board({ columns, focus, collapsedColumns, ...rest }: BoardProps) {
  const visibleColumns = focus ? columns.filter((c) => c.id !== 'done') : columns;

  return (
    <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
      {visibleColumns.map((col) => (
        <Grid key={col.id} size={{ xs: 12, md: 12 / visibleColumns.length }}>
          <Column {...col} {...rest} collapsed={collapsedColumns?.[col.id] ?? false} />
        </Grid>
      ))}
    </Grid>
  );
}
