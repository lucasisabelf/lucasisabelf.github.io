import { useEffect, useState } from 'react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="no-print fixed bottom-6 right-6 w-10 h-10 rounded-full bg-blue text-white text-lg shadow-lg z-40 hover:bg-blue-hover transition-colors"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      ⇧
    </button>
  );
}
