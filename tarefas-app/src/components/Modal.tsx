import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  onClose(): void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Overlay + foco: guarda o elemento que abriu o modal e devolve o foco a ele
 * ao fechar (acessibilidade — nenhum estado global, só uma ref por instância).
 */
export function Modal({ onClose, title, children, footer }: ModalProps) {
  const triggerRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} tabIndex={-1} className="bg-surface rounded-xl p-6 w-[min(420px,90vw)] shadow-2xl outline-none">
        <h2 className="text-lg font-bold text-text mb-4">{title}</h2>
        {children}
        {footer && <div className="flex justify-end gap-2 mt-4">{footer}</div>}
      </div>
    </div>
  );
}
