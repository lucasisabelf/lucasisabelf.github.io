import { useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Zoom in={visible}>
      <Fab
        className="no-print"
        color="primary"
        size="small"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Voltar ao topo"
        title="Voltar ao topo"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}
