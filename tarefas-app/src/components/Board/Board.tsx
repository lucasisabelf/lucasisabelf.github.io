import Grid from '@mui/material/Grid';
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
    <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
      {visibleColumns.map((col) => (
        <Grid key={col.id} size={{ xs: 12, md: 12 / visibleColumns.length }}>
          <Column {...col} {...rest} />
        </Grid>
      ))}
    </Grid>
  );
}
