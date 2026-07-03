interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll(): void;
  onCopySelected(): void;
  onDownloadCsvSelected(): void;
  onCancel(): void;
}

export function BulkActionsBar({ selectedCount, onSelectAll, onCopySelected, onDownloadCsvSelected, onCancel }: BulkActionsBarProps) {
  return (
    <div className="surface-panel flex flex-wrap items-center gap-3 px-4 py-3 mt-3 text-[0.85rem] text-text-muted">
      <span>
        {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
      </span>
      <button type="button" className="link-btn" onClick={onSelectAll}>
        Selecionar todos
      </button>
      <button type="button" className="link-btn" onClick={onCopySelected}>
        Copiar selecionados
      </button>
      <button type="button" className="link-btn" onClick={onDownloadCsvSelected}>
        Baixar CSV selecionados
      </button>
      <button type="button" className="link-btn" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  );
}
