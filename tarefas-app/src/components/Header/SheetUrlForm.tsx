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
        className="field-input px-2.5 py-2 cursor-pointer whitespace-nowrap"
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
        className="field-input flex-1 min-w-[200px] px-3.5 py-2"
        type="url"
        placeholder="https://docs.google.com/spreadsheets/d/..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(value.trim());
        }}
      />
      <button type="button" className="btn-primary" disabled={loading} onClick={() => onSubmit(value.trim())}>
        Carregar
      </button>
    </div>
  );
}
