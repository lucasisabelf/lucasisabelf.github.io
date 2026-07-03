import { describe, it, expect } from 'vitest';
import { buildBoardCsv } from './csv';
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
