import { SHEETS_MAP } from '../../lib/config';

interface SheetUrlFormProps {
  value: string;
  onChange(url: string): void;
  onSubmit(url: string): void;
  loading: boolean;
  recentSheets: string[];
}

export function SheetUrlForm({ value, onChange, onSubmit, loading, recentSheets }: SheetUrlFormProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <select
        className="border border-border-input rounded px-2 py-1.5 bg-surface text-text"
        value=""
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
      >
        <option value="">Selecionar planilha...</option>
        {Object.entries(SHEETS_MAP).map(([name, url]) => (
          <option key={name} value={url}>
            {name}
          </option>
        ))}
        {recentSheets.length > 0 && (
          <optgroup label="Recentes">
            {recentSheets.map((url) => (
              <option key={url} value={url}>
                {url.length > 50 ? url.slice(0, 50) + '…' : url}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <input
        className="flex-1 min-w-[200px] border border-border-input rounded px-2.5 py-1.5 bg-surface text-text"
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
