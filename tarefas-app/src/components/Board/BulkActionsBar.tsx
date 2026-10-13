import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AppMenu } from '../AppMenu';
import { COLUMN_IDS, SHEET_NAMES } from '../../lib/config';

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll(): void;
  onCopySelected(): void;
  onDownloadCsvSelected(): void;
  onCancel(): void;
  /** Só passados quando a edição direta está configurada. */
  onMoveSelected?: (toColumnId: string) => void;
  onDeleteSelected?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onSelectAll,
  onCopySelected,
  onDownloadCsvSelected,
  onCancel,
  onMoveSelected,
  onDeleteSelected,
}: BulkActionsBarProps) {
  const disabled = selectedCount === 0;
  return (
    <Paper elevation={1} sx={{ mt: 1.5 }}>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
        </Typography>
        <Button size="small" onClick={onSelectAll}>Selecionar todos</Button>
        <Button size="small" onClick={onCopySelected}>Copiar selecionados</Button>
        <Button size="small" onClick={onDownloadCsvSelected}>Baixar CSV selecionados</Button>
        {onMoveSelected && (
          <AppMenu label="Mover para" buttonProps={{ size: 'small', endIcon: <ExpandMoreIcon />, disabled }}>
            {(close) =>
              COLUMN_IDS.map((id, i) => (
                <MenuItem key={id} onClick={() => { onMoveSelected(id); close(); }}>
                  {SHEET_NAMES[i]}
                </MenuItem>
              ))
            }
          </AppMenu>
        )}
        {onDeleteSelected && (
          <Button size="small" color="error" disabled={disabled} onClick={onDeleteSelected}>
            Excluir selecionados
          </Button>
        )}
        <Button size="small" onClick={onCancel}>Cancelar</Button>
      </Stack>
    </Paper>
  );
}
