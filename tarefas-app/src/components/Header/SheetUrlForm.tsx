interface SheetUrlFormProps {
  value: string;
  onChange(url: string): void;
  onSubmit(url: string): void;
  loading: boolean;
}

export function SheetUrlForm({ value, onChange, onSubmit, loading }: SheetUrlFormProps) {
  return (
    <div className="flex gap-2 mt-2">
      <input
        className="flex-1 border border-border-input rounded px-2.5 py-1.5 bg-surface text-text"
        type="url"
        placeholder="https://docs.google.com/spreadsheets/d/..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(value.trim());
        }}
      />
      <button
        type="button"
        className="rounded px-3 py-1.5 bg-blue text-white disabled:opacity-50"
        disabled={loading}
        onClick={() => onSubmit(value.trim())}
      >
        Carregar
      </button>
    </div>
  );
}
