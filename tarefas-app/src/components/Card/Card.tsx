import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { CardData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardFilterHandlers, CardSelectionHandlers } from '../../types/handlers';
import { parseChecklist } from '../../lib/checklist';
import { getDateInfo } from '../../lib/dateStatus';
import { CardBadges } from './CardBadges';
import { CardActions } from './CardActions';

const PRIORITY_BORDER_COLOR: Record<string, string> = {
  Alta: '#c53030',
  Média: '#b45309',
  Baixa: '#a0aec0',
};

interface CardProps
  extends CardData,
    CardActionHandlers,
    CardFilterHandlers,
    CardDetailHandlers,
    Partial<CardSelectionHandlers> {
  expandActions: boolean;
  readonly: boolean;
  activeFilter?: string;
  isDoneColumn?: boolean;
}

export function Card(props: CardProps) {
  const { title, desc, date, priority, responsavel, link, tags, recurrence, isNew, daysInColumn, expandActions, readonly, activeFilter, isDoneColumn } = props;
  const { onOpenDetail, onFilterByPriority, onFilterByTag, onCopy, onDuplicate, onWhatsApp, onCalendar, onAskClaude } = props;
  const checklist = parseChecklist(desc);
  const cardData: CardData = { title, desc, date, priority, responsavel, link, tags, recurrence };
  const dateInfo = getDateInfo(date);
  const overdueStage = !isDoneColumn && dateInfo ? dateInfo.overdueStage : 0;

  return (
    <MuiCard
      variant="outlined"
      className={`card-surface ${overdueStage > 0 ? `card-overdue-stage card-overdue-stage-${overdueStage}` : ''}`}
      sx={{
        position: 'relative',
        borderLeft: priority && PRIORITY_BORDER_COLOR[priority] ? `3px solid ${PRIORITY_BORDER_COLOR[priority]}` : undefined,
        borderStyle: responsavel ? 'solid' : 'dashed',
        bgcolor: overdueStage > 0 ? 'var(--overdue-bg)' : undefined,
      }}
    >
      <CardContent sx={{ p: 1.5, position: 'relative', zIndex: 1, '&:last-child': { pb: 1.5 } }}>
        {props.onToggleSelect && (
          <Checkbox
            size="small"
            sx={{ position: 'absolute', top: 4, right: 4 }}
            checked={props.selected}
            onChange={() => props.onToggleSelect!(title)}
          />
        )}

        {isNew && <Chip size="small" color="success" label="Novo" sx={{ mb: 0.5, fontWeight: 700 }} />}

        <Box sx={{ cursor: 'pointer' }} onClick={() => onOpenDetail(cardData)}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
            {checklist && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                {checklist.filter((i) => i.done).length}/{checklist.length}
              </Typography>
            )}
          </Typography>
        </Box>

        {checklist ? (
          <Box component="ul" sx={{ mt: 0.75, mb: 0, pl: 0, listStyle: 'none', fontSize: '0.82rem', color: 'text.secondary' }}>
            {checklist.map((item, i) => (
              <li key={i}>
                {item.done ? '☑' : '☐'} {item.text}
              </li>
            ))}
          </Box>
        ) : (
          desc && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {desc}
            </Typography>
          )
        )}

        <CardBadges
          date={date}
          priority={priority}
          recurrence={recurrence}
          responsavel={responsavel}
          tags={tags}
          activeFilter={activeFilter}
          onFilterByPriority={onFilterByPriority}
          onFilterByTag={onFilterByTag}
        />

        {daysInColumn !== undefined && daysInColumn > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
            há {daysInColumn} dia{daysInColumn !== 1 ? 's' : ''}
          </Typography>
        )}

        <CardActions
          card={cardData}
          expandActions={expandActions}
          readonly={readonly}
          onCopy={onCopy}
          onDuplicate={onDuplicate}
          onWhatsApp={onWhatsApp}
          onCalendar={onCalendar}
          onAskClaude={onAskClaude}
        />
      </CardContent>
    </MuiCard>
  );
}
