import MuiCardActions from '@mui/material/CardActions';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import type { CardData } from '../../types/card';
import type { CardActionHandlers, CardEditHandlers } from '../../types/handlers';
import { COLUMN_IDS, SHEET_NAMES } from '../../lib/config';
import { AppMenu } from '../AppMenu';

interface CardActionsProps extends CardActionHandlers, Partial<CardEditHandlers> {
  card: CardData;
  columnId?: string;
  expandActions: boolean;
  readonly: boolean;
}

export function CardActions({ card, columnId, expandActions, readonly, onCopy, onDuplicate, onWhatsApp, onCalendar, onAskClaude, onEdit, onMove, onDelete }: CardActionsProps) {
  const editable = !readonly && columnId !== undefined && onEdit && onMove && onDelete;
  const moveTargets = COLUMN_IDS.map((id, i) => ({ id, title: SHEET_NAMES[i] })).filter((c) => c.id !== columnId);

  const editMenuItems = (close: () => void) =>
    editable
      ? [
          <MenuItem key="edit" onClick={() => { onEdit(card, columnId); close(); }}>Editar</MenuItem>,
          ...moveTargets.map((target) => (
            <MenuItem key={`move-${target.id}`} onClick={() => { onMove(card, columnId, target.id); close(); }}>
              Mover para {target.title}
            </MenuItem>
          )),
          <MenuItem key="delete" sx={{ color: 'error.main' }} onClick={() => { onDelete(card, columnId); close(); }}>Excluir</MenuItem>,
        ]
      : [];

  const moreMenuItems = (close: () => void) => [
    <MenuItem key="ask" onClick={() => { onAskClaude(card); close(); }}>Sugerir ao Claude</MenuItem>,
    <MenuItem key="cal" onClick={() => { onCalendar(card); close(); }}>+ Agenda</MenuItem>,
    <MenuItem key="wa" onClick={() => { onWhatsApp(card); close(); }}>WhatsApp</MenuItem>,
    ...(readonly ? [] : [<MenuItem key="dup" onClick={() => { onDuplicate(card); close(); }}>Duplicar</MenuItem>]),
    ...editMenuItems(close),
  ];

  return (
    <MuiCardActions className="no-print" sx={{ px: 0, pb: 0, pt: 1, mt: 1, borderTop: '1px solid', borderColor: 'divider', gap: 0.5 }}>
      <Button size="small" onClick={() => onCopy(card)}>
        Copiar
      </Button>
      {card.link && (
        <IconButton size="small" component="a" href={card.link} target="_blank" rel="noopener noreferrer">
          <LinkIcon fontSize="small" />
        </IconButton>
      )}
      {expandActions ? (
        <>
          <Button size="small" onClick={() => onAskClaude(card)}>Sugerir ao Claude</Button>
          <Button size="small" onClick={() => onCalendar(card)}>+ Agenda</Button>
          <Button size="small" onClick={() => onWhatsApp(card)}>WhatsApp</Button>
          {!readonly && <Button size="small" onClick={() => onDuplicate(card)}>Duplicar</Button>}
          {editable && (
            <>
              <Button size="small" onClick={() => onEdit(card, columnId)}>Editar</Button>
              <AppMenu label="Mover" buttonProps={{ size: 'small', endIcon: <ExpandMoreIcon /> }}>
                {(close) =>
                  moveTargets.map((target) => (
                    <MenuItem key={target.id} onClick={() => { onMove(card, columnId, target.id); close(); }}>
                      {target.title}
                    </MenuItem>
                  ))
                }
              </AppMenu>
              <Button size="small" color="error" onClick={() => onDelete(card, columnId)}>Excluir</Button>
            </>
          )}
        </>
      ) : (
        <AppMenu label="Mais" buttonProps={{ size: 'small', endIcon: <ExpandMoreIcon /> }}>
          {moreMenuItems}
        </AppMenu>
      )}
    </MuiCardActions>
  );
}
