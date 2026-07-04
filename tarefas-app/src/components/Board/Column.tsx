import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { ColumnData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardFilterHandlers, CardSelectionHandlers } from '../../types/handlers';
import { Card } from '../Card/Card';

const HEADER_COLOR: Record<string, string> = {
  todo: '#3b82f6',
  progress: '#f59e0b',
  done: '#10b981',
};

interface ColumnProps
  extends ColumnData,
    CardActionHandlers,
    CardFilterHandlers,
    CardDetailHandlers,
    Partial<CardSelectionHandlers> {
  expandActions: boolean;
  readonly: boolean;
  activeFilter?: string;
  onCreateTask?: () => void;
  selectedTitles?: Set<string>;
  newTitles?: Set<string>;
  daysByTitle?: Map<string, number>;
}

export function Column(props: ColumnProps) {
  const { id, title, cards, onCreateTask, selectedTitles, newTitles, daysByTitle, onToggleSelect, ...cardHandlers } = props;

  return (
    <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, fontWeight: 700, fontSize: '0.95rem', letterSpacing: 0.3, color: '#fff', bgcolor: HEADER_COLOR[id], userSelect: 'none' }}>
        {title}
        {cards.length > 0 ? ` (${cards.length})` : ''}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          p: 1.5,
          minHeight: 60,
          maxHeight: '70vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
        }}
      >
        {cards.length === 0 ? (
          <Box sx={{ textAlign: 'center', fontSize: '0.85rem', color: 'text.disabled', py: 1 }}>
            <Typography variant="body2" color="text.disabled">
              Nenhuma tarefa
            </Typography>
            {onCreateTask && (
              <Button size="small" onClick={onCreateTask} sx={{ mt: 0.5 }}>
                + Nova Tarefa
              </Button>
            )}
          </Box>
        ) : (
          cards.map((card) => (
            <Card
              key={card.title}
              {...card}
              {...cardHandlers}
              onToggleSelect={onToggleSelect}
              selected={selectedTitles?.has(card.title) ?? false}
              isNew={newTitles?.has(card.title) ?? card.isNew}
              daysInColumn={daysByTitle?.get(card.title) ?? card.daysInColumn}
              isDoneColumn={id === 'done'}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}
