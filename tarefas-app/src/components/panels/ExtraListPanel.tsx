import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import AddIcon from '@mui/icons-material/Add';
import type { ExtraList } from '../../hooks/useExtraLists';
import type { ListItemEditHandlers } from '../../types/handlers';

const PRIORITY_COLOR: Record<string, 'error' | 'warning' | 'default'> = {
  Alta: 'error',
  Média: 'warning',
  Baixa: 'default',
};

type ExtraListPanelProps = ExtraList & Partial<ListItemEditHandlers>;

export function ExtraListPanel({ name, items, onCreateItem, onEditItem, onDeleteItem }: ExtraListPanelProps) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {name}
        </Typography>
        {onCreateItem && (
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onCreateItem}>
            Novo item
          </Button>
        )}
      </Stack>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 1 }}>
          Nenhum item nesta lista
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {items.map((item) => (
            <Grid key={item.nome} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card variant="outlined" className="card-surface">
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.nome}
                  </Typography>
                  {item.topico && (
                    <Typography variant="body2" color="text.secondary">
                      {item.topico}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                    {item.prioridade && PRIORITY_COLOR[item.prioridade] && (
                      <Chip size="small" label={item.prioridade} color={PRIORITY_COLOR[item.prioridade]} />
                    )}
                    {item.status && <Chip size="small" label={item.status} variant="outlined" />}
                  </Stack>
                  {item.motivo && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      {item.motivo}
                    </Typography>
                  )}
                  {onEditItem && onDeleteItem && (
                    <CardActions className="no-print" sx={{ px: 0, pb: 0, pt: 1, mt: 1, borderTop: '1px solid', borderColor: 'divider', gap: 0.5 }}>
                      <Button size="small" onClick={() => onEditItem(item)}>Editar</Button>
                      <Button size="small" color="error" onClick={() => onDeleteItem(item)}>Excluir</Button>
                    </CardActions>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}
