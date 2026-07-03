import type { ExtraList } from '../../hooks/useExtraLists';

const PRIORITY_CLASS: Record<string, string> = {
  Alta: 'bg-priority-high-bg text-priority-high-color',
  Média: 'bg-priority-mid-bg text-priority-mid-color',
  Baixa: 'bg-badge-bg text-empty-col',
};

export function ExtraListPanel({ name, items }: ExtraList) {
  return (
    <div className="surface-panel p-6">
      <h2 className="text-[1.05rem] font-bold text-text mb-4">{name}</h2>
      {items.length === 0 ? (
        <div className="text-center text-sm text-empty-col py-2">Nenhum item nesta lista</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.nome} className="card-surface bg-surface-card border border-border rounded-lg p-3">
              <div className="font-medium text-text-card-title">{item.nome}</div>
              {item.topico && <div className="text-sm text-text-muted">{item.topico}</div>}
              <div className="flex gap-1.5 mt-1.5">
                {item.prioridade && PRIORITY_CLASS[item.prioridade] && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_CLASS[item.prioridade]}`}>
                    {item.prioridade}
                  </span>
                )}
                {item.status && (
                  <span className="rounded-full px-2 py-0.5 text-xs bg-badge-bg text-text-muted">{item.status}</span>
                )}
              </div>
              {item.motivo && <div className="text-sm text-text-muted mt-1">{item.motivo}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
