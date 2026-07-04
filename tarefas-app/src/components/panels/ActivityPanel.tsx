import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { ActivityEntry } from '../../hooks/useActivityLog';

interface ActivityPanelProps {
  log: ActivityEntry[];
}

export function ActivityPanel({ log }: ActivityPanelProps) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Atividade recente
      </Typography>
      {log.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 1 }}>
          Nenhuma atividade registrada ainda
        </Typography>
      ) : (
        <List dense disablePadding>
          {log.map((entry, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText
                slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                primary={`${entry.title}: ${entry.from} → ${entry.to}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
