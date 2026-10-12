import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AppMenu } from '../AppMenu';

interface HeaderMenusProps {
  onCopyBoardLink(): void;
  onCopySheetUrl(): void;
  onShareWhatsApp(): void;
  onExportText(): void;
  onDownloadMd(): void;
  onDownloadJson(): void;
  onDownloadCsv(): void;
  onDownloadIcs(): void;
}

export function HeaderMenus({
  onCopyBoardLink,
  onCopySheetUrl,
  onShareWhatsApp,
  onExportText,
  onDownloadMd,
  onDownloadJson,
  onDownloadCsv,
  onDownloadIcs,
}: HeaderMenusProps) {
  return (
    <Stack direction="row" spacing={1}>
      <AppMenu label="Compartilhar" buttonProps={{ endIcon: <ExpandMoreIcon />, size: 'small' }}>
        {(close) => [
          <MenuItem key="link" onClick={() => { onCopyBoardLink(); close(); }}>Copiar link do board</MenuItem>,
          <MenuItem key="url" onClick={() => { onCopySheetUrl(); close(); }}>Copiar URL</MenuItem>,
          <MenuItem key="wa" onClick={() => { onShareWhatsApp(); close(); }}>WhatsApp</MenuItem>,
          <MenuItem key="export" onClick={() => { onExportText(); close(); }}>Exportar (E)</MenuItem>,
        ]}
      </AppMenu>
      <AppMenu label="Baixar" buttonProps={{ endIcon: <ExpandMoreIcon />, size: 'small' }}>
        {(close) => [
          <MenuItem key="md" onClick={() => { onDownloadMd(); close(); }}>Baixar .md</MenuItem>,
          <MenuItem key="json" onClick={() => { onDownloadJson(); close(); }}>JSON</MenuItem>,
          <MenuItem key="csv" onClick={() => { onDownloadCsv(); close(); }}>CSV</MenuItem>,
          <MenuItem key="ics" onClick={() => { onDownloadIcs(); close(); }}>Agenda (.ics)</MenuItem>,
        ]}
      </AppMenu>
    </Stack>
  );
}
