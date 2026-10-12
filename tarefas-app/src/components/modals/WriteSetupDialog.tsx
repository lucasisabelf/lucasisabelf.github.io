import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import appsScriptCode from '../../appsScript/Code.gs?raw';
import { WEB_APP_URL_RE } from '../../lib/sheetWriter';

interface WriteSetupDialogProps {
  endpoint: string;
  sheetUrl: string;
  onSave(url: string): void;
  onClose(): void;
}

export function WriteSetupDialog({ endpoint, sheetUrl, onSave, onClose }: WriteSetupDialogProps) {
  const [url, setUrl] = useState(endpoint);
  const [copied, setCopied] = useState(false);
  const trimmed = url.trim();
  const invalid = trimmed !== '' && !WEB_APP_URL_RE.test(trimmed);

  function handleCopyCode() {
    navigator.clipboard.writeText(appsScriptCode).then(() => setCopied(true));
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edição direta na planilha</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Permite criar, editar, mover e excluir tarefas direto do board, via um Apps Script na própria planilha. Configure uma vez por planilha:
        </Typography>
        <Box component="ol" sx={{ pl: 2.5, my: 1, typography: 'body2', '& li': { mb: 0.5 } }}>
          <li>
            <Button size="small" variant="outlined" onClick={handleCopyCode}>
              {copied ? 'Código copiado ✓' : 'Copiar código do script'}
            </Button>
          </li>
          <li>
            Na{' '}
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
              planilha
            </a>
            , abra <strong>Extensões › Apps Script</strong>, apague o conteúdo de <code>Code.gs</code>, cole o código e salve.
          </li>
          <li>
            <strong>Implantar › Nova implantação</strong> › tipo <strong>App da Web</strong>. Executar como: <strong>Eu</strong>; Quem pode acessar:{' '}
            <strong>Qualquer pessoa</strong>. Autorize o acesso quando o Google pedir.
          </li>
          <li>Copie a URL do app da Web (termina em <code>/exec</code>) e cole abaixo.</li>
        </Box>
        <TextField
          label="URL do app da Web"
          placeholder="https://script.google.com/macros/s/.../exec"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={invalid}
          helperText={invalid ? 'A URL deve ser https://script.google.com/macros/s/…/exec' : ' '}
          fullWidth
          sx={{ mt: 1 }}
        />
        <Alert severity="info" sx={{ mt: 1 }}>
          Quem tiver essa URL consegue alterar a planilha — não compartilhe. Ela fica salva só neste navegador.
        </Alert>
      </DialogContent>
      <DialogActions>
        {endpoint && (
          <Button color="error" onClick={() => onSave('')} sx={{ mr: 'auto' }}>
            Desconectar
          </Button>
        )}
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!trimmed || invalid} onClick={() => onSave(trimmed)}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
