import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import type { CardData } from '../../types/card';
import { parseChecklist } from '../../lib/checklist';
import { parsePtBrDate } from '../../lib/date';

const MS_PER_DAY = 86400000;

interface CardDetailModalProps {
  card: CardData;
  columnTitle: string;
  onClose(): void;
}

export function CardDetailModal({ card, columnTitle, onClose }: CardDetailModalProps) {
  const checklist = parseChecklist(card.desc);

  let dateText = '';
  if (card.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsed = parsePtBrDate(card.date);
    const delta = parsed ? Math.round((parsed.getTime() - today.getTime()) / MS_PER_DAY) : null;
    const suffix =
      delta === null ? '' : delta > 0 ? ` · em ${delta} dia${delta !== 1 ? 's' : ''}` : delta < 0 ? ` · vencida há ${Math.abs(delta)} dia${Math.abs(delta) !== 1 ? 's' : ''}` : ' · hoje';
    dateText = `Data: ${card.date}${suffix}`;
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{card.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25}>
          {checklist ? (
            <Stack component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
              {checklist.map((item, i) => (
                <Typography component="li" variant="body2" color="text.secondary" key={i}>
                  {item.done ? '☑' : '☐'} {item.text}
                </Typography>
              ))}
            </Stack>
          ) : (
            card.desc && (
              <Typography variant="body2" color="text.secondary">
                {card.desc}
              </Typography>
            )
          )}
          <Typography variant="body2" color="text.secondary">
            Coluna: {columnTitle}
          </Typography>
          {card.date && (
            <Typography variant="body2" color="text.secondary">
              {dateText}
            </Typography>
          )}
          {card.priority && (
            <Typography variant="body2" color="text.secondary">
              Prioridade: {card.priority}
            </Typography>
          )}
          {card.responsavel && (
            <Typography variant="body2" color="text.secondary">
              Responsável: {card.responsavel}
            </Typography>
          )}
          {card.link && (
            <Typography variant="body2" color="text.secondary">
              Link: <Link href={card.link} target="_blank" rel="noopener noreferrer">{card.link}</Link>
            </Typography>
          )}
          {card.tags.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {card.tags.map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" />
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
