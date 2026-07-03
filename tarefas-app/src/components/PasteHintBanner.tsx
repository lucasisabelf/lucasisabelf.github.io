interface PasteHintBannerProps {
  onDismiss(): void;
}

export function PasteHintBanner({ onDismiss }: PasteHintBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 my-3 px-3 py-2.5 rounded-md text-sm bg-feedback-bg border border-feedback-border text-feedback-color">
      <span>📋 Copiado! Cole (Ctrl+V) na aba correspondente da planilha para confirmar a tarefa.</span>
      <button type="button" className="rounded px-2 py-1 border border-feedback-border" onClick={onDismiss}>
        Ok, entendi
      </button>
    </div>
  );
}
