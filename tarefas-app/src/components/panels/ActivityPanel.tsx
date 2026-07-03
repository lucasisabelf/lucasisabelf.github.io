import type { ActivityEntry } from '../../hooks/useActivityLog';

interface ActivityPanelProps {
  log: ActivityEntry[];
}

export function ActivityPanel({ log }: ActivityPanelProps) {
  return (
    <div className="surface-panel p-6">
      <h2 className="text-[1.05rem] font-bold text-text mb-4">Atividade recente</h2>
      {log.length === 0 ? (
        <div className="text-center text-sm text-empty-col py-2">Nenhuma atividade registrada ainda</div>
      ) : (
        <ul className="space-y-1.5 text-[0.85rem] text-text-muted">
          {log.map((entry, i) => (
            <li key={i}>
              {entry.title}: {entry.from} → {entry.to}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
