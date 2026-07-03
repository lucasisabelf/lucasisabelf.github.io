import type { ActivityEntry } from '../../hooks/useActivityLog';

interface ActivityPanelProps {
  log: ActivityEntry[];
}

export function ActivityPanel({ log }: ActivityPanelProps) {
  return (
    <div className="bg-surface rounded-lg p-4">
      <h2 className="font-semibold mb-2">Atividade recente</h2>
      {log.length === 0 ? (
        <div className="text-center text-sm text-empty-col py-2">Nenhuma atividade registrada ainda</div>
      ) : (
        <ul className="space-y-1 text-sm text-text-muted">
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
