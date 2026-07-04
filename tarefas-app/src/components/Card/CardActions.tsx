import MuiCardActions from '@mui/material/CardActions';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import type { CardData } from '../../types/card';
import type { CardActionHandlers } from '../../types/handlers';
import { AppMenu } from '../AppMenu';

interface CardActionsProps extends CardActionHandlers {
  card: CardData;
  expandActions: boolean;
  readonly: boolean;
}

export function CardActions({ card, expandActions, readonly, onCopy, onDuplicate, onWhatsApp, onCalendar, onAskClaude }: CardActionsProps) {
  const moreMenuItems = (close: () => void) => [
    <MenuItem key="ask" onClick={() => { onAskClaude(card); close(); }}>Sugerir ao Claude</MenuItem>,
    <MenuItem key="cal" onClick={() => { onCalendar(card); close(); }}>+ Agenda</MenuItem>,
    <MenuItem key="wa" onClick={() => { onWhatsApp(card); close(); }}>WhatsApp</MenuItem>,
    ...(readonly ? [] : [<MenuItem key="dup" onClick={() => { onDuplicate(card); close(); }}>Duplicar</MenuItem>]),
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
        </>
      ) : (
        <AppMenu label="Mais" buttonProps={{ size: 'small', endIcon: <ExpandMoreIcon /> }}>
          {moreMenuItems}
        </AppMenu>
      )}
    </MuiCardActions>
  );
}
