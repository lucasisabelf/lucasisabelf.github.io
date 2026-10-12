import { describe, it, expect } from 'vitest';
import { listItemToRow, mapListItemRow } from './mapListItemRow';

describe('listItemToRow', () => {
  it('round-trips through mapListItemRow', () => {
    const item = { nome: 'A', topico: 'B', prioridade: 'Alta', status: 'Feito', motivo: 'C' };
    expect(mapListItemRow(listItemToRow(item))).toEqual(item);
  });
});
