import { createTheme, type Theme } from '@mui/material/styles';

/**
 * Espelha o subconjunto de `theme.css` (:root / [data-theme="dark"]) que o
 * MUI precisa resolver em JS pra montar a paleta — não dá pra ler via
 * `getComputedStyle` porque o objeto de tema é calculado ANTES do atributo
 * `data-theme` ser aplicado no DOM (timing de render vs. commit). Cores
 * semânticas que o MUI não usa diretamente (prioridade, atrasado, hoje,
 * forca) continuam só em `theme.css`, referenciadas via `var(--x)` nos `sx`
 * — não duplicadas aqui.
 */
const PALETTE = {
  light: {
    primaryMain: '#3b82f6',
    primaryDark: '#2563eb',
    error: '#c53030',
    warning: '#92400e',
    success: '#276749',
    bg: '#f0f2f5',
    surface: '#fff',
    text: '#1a202c',
    textMuted: '#718096',
  },
  dark: {
    primaryMain: '#3b82f6',
    primaryDark: '#2563eb',
    error: '#fc8181',
    warning: '#f59e0b',
    success: '#68d391',
    bg: '#0f1117',
    surface: '#1e2130',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
  },
};

export function createAppTheme(mode: 'light' | 'dark'): Theme {
  const p = PALETTE[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: p.primaryMain, dark: p.primaryDark },
      error: { main: p.error },
      warning: { main: p.warning },
      success: { main: p.success },
      background: { default: p.bg, paper: p.surface },
      text: { primary: p.text, secondary: p.textMuted },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  });
}
