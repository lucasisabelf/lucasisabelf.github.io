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
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <div className="relative flex-1 min-w-[180px]">
        <input
          ref={inputRef}
          className="field-input w-full px-3.5 py-2 pr-9"
          placeholder="Filtrar tarefas..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label="Limpar filtro"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text text-[0.85rem] bg-transparent border-0 cursor-pointer p-0 leading-none"
            onClick={() => onQueryChange('')}
          >
            ✕
          </button>
        )}
      </div>
      {responsavelOptions.length > 0 && (
        <select
          className="field-input px-2.5 py-2 cursor-pointer"
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
        <span className="text-[0.75rem] text-text-muted">
          {visibleCount} de {totalCount}
        </span>
      )}
    </div>
  );
}
