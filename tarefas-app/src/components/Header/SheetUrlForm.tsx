import { useState } from 'react';

interface SheetUrlFormProps {
  onSubmit(url: string): void;
  loading: boolean;
}

export function SheetUrlForm({ onSubmit, loading }: SheetUrlFormProps) {
  const [url, setUrl] = useState('');

  return (
    <div className="flex gap-2 mt-2">
      <input
        className="flex-1 border border-border-input rounded px-2.5 py-1.5 bg-surface text-text"
        type="url"
        placeholder="https://docs.google.com/spreadsheets/d/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(url.trim());
        }}
      />
      <button
        type="button"
        className="rounded px-3 py-1.5 bg-blue text-white disabled:opacity-50"
        disabled={loading}
        onClick={() => onSubmit(url.trim())}
      >
        Carregar
      </button>
    </div>
  );
}
