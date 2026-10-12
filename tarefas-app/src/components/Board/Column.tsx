import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { ColumnData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardEditHandlers, CardFilterHandlers, CardSelectionHandlers, ColumnHeaderHandlers } from '../../types/handlers';
import { Card } from '../Card/Card';
import { CARD_DRAG_MIME, parseDraggedCard } from '../../lib/dragCard';

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
    ColumnHeaderHandlers,
    Partial<CardSelectionHandlers>,
    Partial<CardEditHandlers> {
  expandActions: boolean;
  readonly: boolean;
  compact: boolean;
  activeFilter?: string;
  collapsed?: boolean;
  onCreateTask?: () => void;
  selectedTitles?: Set<string>;
  newTitles?: Set<string>;
  daysByTitle?: Map<string, number>;
}

export function Column(props: ColumnProps) {
  const {
    id,
    title,
    cards,
    collapsed,
    onToggleCollapse,
    onCopyColumnText,
    onCopyColumnCsv,
    onCreateTask,
    selectedTitles,
    newTitles,
    daysByTitle,
    onToggleSelect,
    ...cardHandlers
  } = props;
  const { onMove } = cardHandlers;
  const [dragOver, setDragOver] = useState(false);

  function acceptsDrag(e: React.DragEvent) {
    return Boolean(onMove) && e.dataTransfer.types.includes(CARD_DRAG_MIME);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!acceptsDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    setDragOver(false);
    if (!acceptsDrag(e)) return;
    e.preventDefault();
    const dragged = parseDraggedCard(e.dataTransfer.getData(CARD_DRAG_MIME));
    if (dragged && dragged.fromColumnId !== id) onMove!(dragged.card, dragged.fromColumnId, id);
  }

  function handleHeaderClick(e: React.MouseEvent) {
    if (e.ctrlKey && e.shiftKey) {
      onCopyColumnCsv(title, cards);
      return;
    }
    if (e.shiftKey) {
      onCopyColumnText(title, cards);
      return;
    }
    onToggleCollapse(id);
  }

  return (
    <Paper
      elevation={1}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        outline: dragOver ? '2px dashed' : 'none',
        outlineColor: HEADER_COLOR[id],
        outlineOffset: -2,
      }}
    >
      <Box
        onClick={handleHeaderClick}
        sx={{ px: 2, py: 1.5, fontWeight: 700, fontSize: '0.95rem', letterSpacing: 0.3, color: '#fff', bgcolor: HEADER_COLOR[id], userSelect: 'none', cursor: 'pointer' }}
      >
        {title}
        {cards.length > 0 ? ` (${cards.length})` : ''}
      </Box>
      {!collapsed && (
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
                columnId={id}
              />
            ))
          )}
        </Box>
      )}
    </Paper>
  );
}
