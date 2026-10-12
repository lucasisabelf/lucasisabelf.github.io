import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { RECURRENCE_OPTIONS } from '../../lib/recurrence';
import type { Priority, RecurrenceType, TaskDraft } from '../../types/card';

const TASK_DESC_MAX = 300;

export interface NewTaskPrefill {
  name?: string;
  desc?: string;
  date?: string;
  priority?: Priority | '';
  recurrence?: RecurrenceType | '';
}

interface NewTaskModalProps {
  prefill?: NewTaskPrefill;
  mode?: 'create' | 'edit';
  saving?: boolean;
  onClose(): void;
  onSubmit(draft: TaskDraft): void;
}

export function NewTaskModal({ prefill, mode = 'create', saving = false, onClose, onSubmit }: NewTaskModalProps) {
  const [name, setName] = useState(prefill?.name ?? '');
  const [desc, setDesc] = useState(prefill?.desc ?? '');
  const [date, setDate] = useState(prefill?.date || new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Priority | ''>(prefill?.priority ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceType | ''>(prefill?.recurrence ?? '');
  const [nameInvalid, setNameInvalid] = useState(false);

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameInvalid(true);
      return;
    }
    onSubmit({ name: trimmedName, desc, date, priority, recurrence });
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{mode === 'edit' ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField
            label="Nome"
            value={name}
            error={nameInvalid}
            helperText={`${name.length} / 80`}
            slotProps={{ htmlInput: { maxLength: 80 } }}
            onChange={(e) => {
              setName(e.target.value);
              setNameInvalid(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            fullWidth
          />
          <TextField
            label="Descrição"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
            }}
            helperText={`${desc.length} / ${TASK_DESC_MAX}`}
            slotProps={{ htmlInput: { maxLength: TASK_DESC_MAX } }}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField select label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')} fullWidth>
            <MenuItem value="">Sem prioridade</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Média">Média</MenuItem>
            <MenuItem value="Baixa">Baixa</MenuItem>
          </TextField>
          <TextField select label="Repetir" value={recurrence} onChange={(e) => setRecurrence(e.target.value as RecurrenceType | '')} fullWidth>
            <MenuItem value="">Nunca</MenuItem>
            {Object.entries(RECURRENCE_OPTIONS).map(([type, { label }]) => (
              <MenuItem key={type} value={type}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {mode === 'edit' ? 'Salvar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
