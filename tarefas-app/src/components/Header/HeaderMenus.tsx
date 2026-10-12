import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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
  writeConfigured?: boolean;
  onOpenWriteSetup?: () => void;
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
  writeConfigured,
  onOpenWriteSetup,
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
      {onOpenWriteSetup && (
        <Button size="small" color={writeConfigured ? 'success' : 'inherit'} onClick={onOpenWriteSetup} title="Gravar direto na planilha via Apps Script">
          {writeConfigured ? '✓ Edição direta' : 'Conectar edição'}
        </Button>
      )}
    </Stack>
  );
}
