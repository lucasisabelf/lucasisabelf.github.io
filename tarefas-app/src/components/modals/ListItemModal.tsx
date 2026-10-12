import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { ListItemData } from '../../lib/mapListItemRow';

interface ListItemModalProps {
  listName: string;
  item?: ListItemData;
  saving?: boolean;
  onClose(): void;
  onSubmit(item: ListItemData): void;
}

const EMPTY_ITEM: ListItemData = { nome: '', topico: '', prioridade: '', status: '', motivo: '' };

export function ListItemModal({ listName, item, saving = false, onClose, onSubmit }: ListItemModalProps) {
  const [draft, setDraft] = useState<ListItemData>(item ?? EMPTY_ITEM);
  const [nameInvalid, setNameInvalid] = useState(false);

  function update(field: keyof ListItemData, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    const nome = draft.nome.trim();
    if (!nome) {
      setNameInvalid(true);
      return;
    }
    onSubmit({ ...draft, nome });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{item ? `Editar item — ${listName}` : `Novo item — ${listName}`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField
            label="Nome"
            value={draft.nome}
            error={nameInvalid}
            onChange={(e) => {
              update('nome', e.target.value);
              setNameInvalid(false);
            }}
            autoFocus
            fullWidth
          />
          <TextField label="Tópico" value={draft.topico} onChange={(e) => update('topico', e.target.value)} fullWidth />
          <TextField select label="Prioridade" value={draft.prioridade} onChange={(e) => update('prioridade', e.target.value)} fullWidth>
            <MenuItem value="">Sem prioridade</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Média">Média</MenuItem>
            <MenuItem value="Baixa">Baixa</MenuItem>
          </TextField>
          <TextField label="Status" value={draft.status} onChange={(e) => update('status', e.target.value)} fullWidth />
          <TextField label="Motivo" value={draft.motivo} onChange={(e) => update('motivo', e.target.value)} multiline rows={2} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {item ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
