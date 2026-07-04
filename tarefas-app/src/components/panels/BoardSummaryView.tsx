import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import type { BoardSummary } from '../../lib/boardSummary';

export function BoardSummaryView({ summary }: { summary: BoardSummary }) {
  if (summary.total === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Nenhuma tarefa encontrada — confira se os dados começam na linha 3 e se os nomes das abas conferem.
      </Typography>
    );
  }

  const parts = [`${summary.total} total`, `${summary.inProgress} em andamento`, `${summary.done} concluídas`];
  let text = parts.join(' · ');

  if (summary.overdue > 0) {
    text += ` · ${summary.overdue} vencida${summary.overdue !== 1 ? 's' : ''}`;
    const breakdown = Object.entries(summary.overdueByResponsavel)
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ');
    if (breakdown) text += ` (${breakdown})`;
  }
  if (summary.warning > 0) text += ` · ${summary.warning} com prazo próximo`;

  const { Alta, Média, Baixa } = summary.priorityCounts;
  if (Alta > 0 || Média > 0 || Baixa > 0) text += ` · Alta: ${Alta} · Média: ${Média} · Baixa: ${Baixa}`;

  if (summary.avgDaysInProgress !== null) {
    text += ` · Tempo médio em andamento: ${summary.avgDaysInProgress} dia${summary.avgDaysInProgress !== 1 ? 's' : ''}`;
  }

  const hhmm = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  text += ` · Atualizado às ${hhmm}`;

  const pct = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;

  return (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, borderRadius: 999, height: 6 }} />
    </Box>
  );
}
