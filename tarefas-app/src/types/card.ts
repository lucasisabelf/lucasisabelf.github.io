export type Priority = 'Alta' | 'Média' | 'Baixa';

export type RecurrenceType = 'semanal' | 'mensal';

/** Dado puro de um card — sem nenhum comportamento associado. */
export interface CardData {
  title: string;
  desc: string;
  date: string;
  priority: Priority | '';
  responsavel: string;
  link: string;
  tags: string[];
  recurrence: RecurrenceType | null;
  daysInColumn?: number;
  isNew?: boolean;
}

export interface ChecklistItem {
  done: boolean;
  text: string;
}

export interface ColumnData {
  id: string;
  title: string;
  cards: CardData[];
}
