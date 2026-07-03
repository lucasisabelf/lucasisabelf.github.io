import type { BoardSummary } from '../../lib/boardSummary';

export function BoardSummaryView({ summary }: { summary: BoardSummary }) {
  if (summary.total === 0) {
    return (
      <p className="mt-2 text-center text-[0.82rem] text-text-muted">
        Nenhuma tarefa encontrada — confira se os dados começam na linha 3 e se os nomes das abas conferem.
      </p>
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
    <div className="mt-2 text-center">
      <p className="text-[0.82rem] text-text-muted">{text}</p>
      <div className="h-1.5 bg-border rounded-full mt-1.5 overflow-hidden">
        <div className="h-full bg-blue rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
