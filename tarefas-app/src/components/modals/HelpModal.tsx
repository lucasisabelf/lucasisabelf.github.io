import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { TEMPLATE_CONFIG, APP_VERSION } from '../../lib/config';

const SHORTCUTS: [string, string][] = [
  ['R', 'Atualizar board'],
  ['F', 'Focar no filtro'],
  ['N', 'Nova tarefa'],
  ['?', 'Mostrar/ocultar atalhos'],
  ['Esc', 'Fechar modal ou atalhos'],
  ['Ctrl+Enter', 'Submeter nova tarefa (no modal)'],
  ['D', 'Alternar modo compacto'],
  ['T', 'Alternar tema claro/escuro'],
  ['S', 'Ciclar ordenação (original → prioridade → data → A-Z)'],
  ['V', 'Alternar modo de seleção'],
  ['G', 'Abrir planilha no Google Sheets'],
  ['P', 'Imprimir board'],
  ['C', 'Colapsar/expandir todas as colunas'],
  ['Header', 'Recolher/expandir uma coluna'],
  ['Shift+Header', 'Copiar coluna como texto'],
  ['Ctrl+Shift+Header', 'Copiar coluna como CSV'],
];

interface HelpModalProps {
  onClose(): void;
  onDownloadTemplate(type: string): void;
  onResetSettings(): void;
}

export function HelpModal({ onClose, onDownloadTemplate, onResetSettings }: HelpModalProps) {
  const [templateType, setTemplateType] = useState('tarefas');

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Atalhos de teclado</DialogTitle>
      <DialogContent>
        <Table size="small" sx={{ mb: 2 }}>
          <TableBody>
            {SHORTCUTS.map(([key, desc]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 600, width: 96 }}>{key}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{desc}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', mb: 2 }}>
          <TextField select size="small" value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
            {Object.entries(TEMPLATE_CONFIG).map(([type, { label }]) => (
              <MenuItem key={type} value={type}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button size="small" onClick={() => onDownloadTemplate(templateType)}>
            Baixar modelo .csv
          </Button>
        </Stack>
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Button size="small" color="error" onClick={onResetSettings}>
            Limpar configurações
          </Button>
          <Typography variant="caption" color="text.secondary">
            Sprint Board v{APP_VERSION}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
