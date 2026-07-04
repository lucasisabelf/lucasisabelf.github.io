import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { AppMenu } from '../AppMenu';
import { SORT_MODES, type SortMode } from '../../lib/sortCards';

interface ViewTogglesProps {
  compact: boolean;
  onToggleCompact(): void;
  focus: boolean;
  onToggleFocus(): void;
  columnTimeVisible: boolean;
  onToggleColumnTime(): void;
  expandActions: boolean;
  onToggleExpandActions(): void;
  sortMode: SortMode;
  onSortModeChange(mode: SortMode): void;
}

const SORT_LABELS: Record<SortMode, string> = {
  original: 'Ordem original',
  prioridade: 'Ordenar por prioridade',
  data: 'Ordenar por data',
  titulo: 'Ordenar A-Z',
};

function ToggleItem({ active, label, onClick }: { active: boolean; label: string; onClick(): void }) {
  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon>{active && <CheckIcon fontSize="small" />}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
}

export function ViewToggles({
  compact,
  onToggleCompact,
  focus,
  onToggleFocus,
  columnTimeVisible,
  onToggleColumnTime,
  expandActions,
  onToggleExpandActions,
  sortMode,
  onSortModeChange,
}: ViewTogglesProps) {
  const activeCount = [compact, focus, columnTimeVisible, expandActions].filter(Boolean).length;

  return (
    <>
      <FormControl size="small">
        <Select value={sortMode} onChange={(e) => onSortModeChange(e.target.value as SortMode)} title="Ciclar ordenação (S)">
          {SORT_MODES.map((mode) => (
            <MenuItem key={mode} value={mode}>
              {SORT_LABELS[mode]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <AppMenu
        label={`Visualização${activeCount > 0 ? ` (${activeCount})` : ''}`}
        buttonProps={{ endIcon: <ExpandMoreIcon />, size: 'small' }}
      >
        {() => [
          <ToggleItem key="compact" active={compact} label="Compacto (D)" onClick={onToggleCompact} />,
          <ToggleItem key="focus" active={focus} label="Foco" onClick={onToggleFocus} />,
          <ToggleItem key="colTime" active={columnTimeVisible} label="Tempo na coluna" onClick={onToggleColumnTime} />,
          <ToggleItem key="expand" active={expandActions} label="Ver todas as ações" onClick={onToggleExpandActions} />,
        ]}
      </AppMenu>
    </>
  );
}
