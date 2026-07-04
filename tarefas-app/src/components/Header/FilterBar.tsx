import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';

interface FilterBarProps {
  query: string;
  onQueryChange(query: string): void;
  responsavelFilter: string;
  onResponsavelFilterChange(value: string): void;
  responsavelOptions: { name: string; count: number }[];
  visibleCount: number;
  totalCount: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function FilterBar({
  query,
  onQueryChange,
  responsavelFilter,
  onResponsavelFilterChange,
  responsavelOptions,
  visibleCount,
  totalCount,
  inputRef,
}: FilterBarProps) {
  const filtering = query !== '' || responsavelFilter !== '';

  return (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        inputRef={inputRef}
        size="small"
        placeholder="Filtrar tarefas..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        sx={{ flex: 1, minWidth: 180 }}
        slotProps={{
          input: {
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Limpar filtro" onClick={() => onQueryChange('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      {responsavelOptions.length > 0 && (
        <TextField
          select
          size="small"
          value={responsavelFilter}
          onChange={(e) => onResponsavelFilterChange(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos os responsáveis</MenuItem>
          {responsavelOptions.map(({ name, count }) => (
            <MenuItem key={name} value={name}>
              {name} ({count})
            </MenuItem>
          ))}
        </TextField>
      )}
      {filtering && (
        <Typography variant="caption" color="text.secondary">
          {visibleCount} de {totalCount}
        </Typography>
      )}
    </Stack>
  );
}
