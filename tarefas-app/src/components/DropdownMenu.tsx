import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DropdownMenuProps {
  label: ReactNode;
  buttonClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}

/**
 * Dropdown genérico e auto-contido: dono do próprio open/close e do
 * posicionamento (`relative` no wrapper, `absolute` no painel). Reusado por
 * todos os menus do header e pelo menu "Mais" de cada card — nunca mais uma
 * cópia solta de painel posicionado relativo a um ancestral distante (era
 * exatamente esse bug, FALHAS.md #004, na versão vanilla).
 */
export function DropdownMenu({ label, buttonClassName, panelClassName, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocumentClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button type="button" className={buttonClassName} onClick={() => setOpen((o) => !o)}>
        {label}
      </button>
      {open && (
        <div
          className={`absolute top-full left-0 mt-1 z-10 flex flex-col bg-surface rounded-lg shadow-xl p-1.5 min-w-[140px] ${panelClassName ?? ''}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
