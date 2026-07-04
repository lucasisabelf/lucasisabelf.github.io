import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import type { CardData } from '../../types/card';
import type { CardFilterHandlers } from '../../types/handlers';
import { getDateInfo } from '../../lib/dateStatus';
import { RECURRENCE_OPTIONS } from '../../lib/recurrence';

const PRIORITY_COLOR: Record<string, 'error' | 'warning' | 'default'> = {
  Alta: 'error',
  Média: 'warning',
  Baixa: 'default',
};

const DATE_STATUS_COLOR: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
  overdue: 'error',
  warning: 'warning',
  today: 'success',
  invalid: 'error',
  normal: 'default',
};

type CardBadgesProps = Pick<CardData, 'date' | 'priority' | 'recurrence' | 'responsavel' | 'tags'> &
  CardFilterHandlers & { activeFilter?: string };

export function CardBadges({ date, priority, recurrence, responsavel, tags, onFilterByPriority, onFilterByTag, activeFilter }: CardBadgesProps) {
  const dateInfo = getDateInfo(date);

  return (
    <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
      {dateInfo && (
        <Chip size="small" label={dateInfo.text} title={dateInfo.title} color={DATE_STATUS_COLOR[dateInfo.status]} variant={dateInfo.status === 'normal' ? 'outlined' : 'filled'} />
      )}
      {priority && PRIORITY_COLOR[priority] && (
        <Chip
          size="small"
          label={priority}
          color={PRIORITY_COLOR[priority]}
          variant={activeFilter === priority ? 'filled' : 'outlined'}
          onClick={() => onFilterByPriority(priority)}
        />
      )}
      {recurrence && RECURRENCE_OPTIONS[recurrence] && <Chip size="small" label={RECURRENCE_OPTIONS[recurrence].badge} />}
      {responsavel && <Chip size="small" label={responsavel} variant="outlined" />}
      {tags.map((tag) => (
        <Chip key={tag} size="small" label={tag} variant={activeFilter === tag ? 'filled' : 'outlined'} onClick={() => onFilterByTag(tag)} />
      ))}
    </Stack>
  );
}
