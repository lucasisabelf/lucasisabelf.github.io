import { describe, it, expect } from 'vitest';
import { buildBoardCsv, buildColumnCsv } from './csv';
import type { ColumnData } from '../../types/card';

const columns: ColumnData[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      {
        title: 'Escrever, testes',
        desc: '',
        date: '01/01/2026',
        priority: 'Alta',
        responsavel: 'Lucas',
        link: '',
        tags: ['sprint'],
        recurrence: null,
      },
    ],
  },
];

describe('buildBoardCsv', () => {
  it('includes the header row and quotes fields with commas', () => {
    const csv = buildBoardCsv(columns);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags');
    expect(lines[1]).toContain('"Escrever, testes"');
  });
});

describe('buildColumnCsv', () => {
  it('includes the same header row as buildBoardCsv, scoped to a single column', () => {
    const csv = buildColumnCsv('To Do', columns[0].cards);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags');
    expect(lines[1]).toContain('To Do');
    expect(lines).toHaveLength(2);
  });
});
