interface FilterBarProps {
  query: string;
  onQueryChange(query: string): void;
  responsavelFilter: string;
  onResponsavelFilterChange(value: string): void;
  responsavelOptions: { name: string; count: number }[];
  visibleCount: number;
  totalCount: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function FilterBar({
  query,
  onQueryChange,
  responsavelFilter,
  onResponsavelFilterChange,
  responsavelOptions,
  visibleCount,
  totalCount,
  inputRef,
}: FilterBarProps) {
  const filtering = query !== '' || responsavelFilter !== '';

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <div className="relative flex-1 min-w-[180px]">
        <input
          ref={inputRef}
          className="w-full border border-border-input rounded px-2.5 py-1.5 bg-surface text-text"
          placeholder="Filtrar tarefas..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label="Limpar filtro"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
            onClick={() => onQueryChange('')}
          >
            ✕
          </button>
        )}
      </div>
      {responsavelOptions.length > 0 && (
        <select
          className="border border-border-input rounded px-2 py-1.5 bg-surface text-text"
          value={responsavelFilter}
          onChange={(e) => onResponsavelFilterChange(e.target.value)}
        >
          <option value="">Todos os responsáveis</option>
          {responsavelOptions.map(({ name, count }) => (
            <option key={name} value={name}>
              {name} ({count})
            </option>
          ))}
        </select>
      )}
      {filtering && (
        <span className="text-xs text-text-muted">
          {visibleCount} de {totalCount}
        </span>
      )}
    </div>
  );
}
