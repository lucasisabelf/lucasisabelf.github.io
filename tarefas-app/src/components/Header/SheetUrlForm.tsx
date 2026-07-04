import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import { SHEETS_MAP } from '../../lib/config';

interface SheetUrlFormProps {
  value: string;
  onChange(url: string): void;
  onSubmit(url: string): void;
  loading: boolean;
  recentSheets: string[];
}

export function SheetUrlForm({ value, onChange, onSubmit, loading, recentSheets }: SheetUrlFormProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <TextField
        select
        size="small"
        value=""
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        label="Planilha"
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">Selecionar planilha...</MenuItem>
        {Object.entries(SHEETS_MAP).map(([name, url]) => (
          <MenuItem key={name} value={url}>
            {name}
          </MenuItem>
        ))}
        {recentSheets.length > 0 && [
          <ListSubheader key="recentes-label">Recentes</ListSubheader>,
          ...recentSheets.map((url) => (
            <MenuItem key={url} value={url}>
              {url.length > 50 ? url.slice(0, 50) + '…' : url}
            </MenuItem>
          )),
        ]}
      </TextField>
      <TextField
        fullWidth
        size="small"
        type="url"
        placeholder="https://docs.google.com/spreadsheets/d/..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(value.trim());
        }}
      />
      <Button variant="contained" disabled={loading} onClick={() => onSubmit(value.trim())} sx={{ whiteSpace: 'nowrap' }}>
        Carregar
      </Button>
    </Stack>
  );
}
