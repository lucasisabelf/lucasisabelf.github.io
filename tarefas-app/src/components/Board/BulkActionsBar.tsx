interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll(): void;
  onCopySelected(): void;
  onDownloadCsvSelected(): void;
  onCancel(): void;
}

export function BulkActionsBar({ selectedCount, onSelectAll, onCopySelected, onDownloadCsvSelected, onCancel }: BulkActionsBarProps) {
  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-badge-bg rounded">
      <span className="text-sm text-text-muted">
        {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
      </span>
      <button type="button" className="text-xs rounded px-2 py-1 border border-border-input" onClick={onSelectAll}>
        Selecionar todos
      </button>
      <button type="button" className="text-xs rounded px-2 py-1 border border-border-input" onClick={onCopySelected}>
        Copiar selecionados
      </button>
      <button type="button" className="text-xs rounded px-2 py-1 border border-border-input" onClick={onDownloadCsvSelected}>
        Baixar CSV selecionados
      </button>
      <button type="button" className="text-xs rounded px-2 py-1 border border-border-input" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  );
}
