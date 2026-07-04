import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll(): void;
  onCopySelected(): void;
  onDownloadCsvSelected(): void;
  onCancel(): void;
}

export function BulkActionsBar({ selectedCount, onSelectAll, onCopySelected, onDownloadCsvSelected, onCancel }: BulkActionsBarProps) {
  return (
    <Paper elevation={1} sx={{ mt: 1.5 }}>
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
        </Typography>
        <Button size="small" onClick={onSelectAll}>Selecionar todos</Button>
        <Button size="small" onClick={onCopySelected}>Copiar selecionados</Button>
        <Button size="small" onClick={onDownloadCsvSelected}>Baixar CSV selecionados</Button>
        <Button size="small" onClick={onCancel}>Cancelar</Button>
      </Stack>
    </Paper>
  );
}
