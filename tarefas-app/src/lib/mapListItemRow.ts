export interface ListItemData {
  nome: string;
  topico: string;
  prioridade: string;
  status: string;
  motivo: string;
}

export function mapListItemRow(row: string[]): ListItemData {
  return {
    nome: (row[0] || '').trim(),
    topico: (row[1] || '').trim(),
    prioridade: (row[2] || '').trim(),
    status: (row[3] || '').trim(),
    motivo: (row[4] || '').trim(),
  };
}
