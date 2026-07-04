import { useState, type MouseEvent, type ReactNode } from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import Menu from '@mui/material/Menu';

interface AppMenuProps {
  label: ReactNode;
  buttonProps?: ButtonProps;
  children: (close: () => void) => ReactNode;
}

/**
 * Trigger + Menu do MUI, encapsulados juntos. Usado por Compartilhar/Baixar/
 * Visualização no header e pelo "Mais" de cada card — o Menu do MUI resolve
 * o posicionamento por âncora (Popper/portal) nativamente, então não existe
 * mais a classe de bug de FALHAS.md #004 (painel relativo a ancestral errado).
 */
export function AppMenu({ label, buttonProps, children }: AppMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  return (
    <>
      <Button onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)} {...buttonProps}>
        {label}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={close}>
        {children(close)}
      </Menu>
    </>
  );
}
