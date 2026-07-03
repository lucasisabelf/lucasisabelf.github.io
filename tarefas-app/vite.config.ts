/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Build output vai direto para ../tarefas (o que o GitHub Pages já serve em /tarefas/).
// emptyOutDir: false é obrigatório — ../tarefas também contém FALHAS.md, FEATURES.md,
// CLAUDE.md, implements.md e .claude/, que não podem ser apagados pelo build.
export default defineConfig({
  base: '/tarefas/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../tarefas',
    emptyOutDir: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
