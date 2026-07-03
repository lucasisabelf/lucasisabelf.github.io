export const APP_VERSION = '2.0';

export const SHEET_NAMES = ['To Do', 'In Progress', 'Done'] as const;
export const COLUMN_IDS = ['todo', 'progress', 'done'] as const;

export const SHEETS_MAP: Record<string, string> = {
  Lucas: 'https://docs.google.com/spreadsheets/d/1pwp4yeXAGXXghSW_tR9gqeaDI0vOOBmuL3-hYKsnzmk/edit?usp=sharing',
  Aline: 'https://docs.google.com/spreadsheets/d/1PrSsBgK5M0SoxYM2cJk7_GpIieNKzbeF2NQQmahvtpk/edit?usp=sharing',
};

export const LISTS_SHEET_NAME = 'Listas';
export const LISTS_RANGE = 'A1:A';
export const LISTS_HEADER = 'lista';

export const EXTRA_LIST_RANGE = 'A1:E';
export const EXTRA_LIST_HEADER = 'nome';

export const TEMPLATE_HEADERS = ['Título', 'Descrição', 'Data', 'Prioridade', 'Responsável', 'Link', 'Tags'];
export const EXTRA_LIST_TEMPLATE_HEADERS = ['Nome', 'Tópico', 'Prioridade', 'Status', 'Motivo'];

export interface TemplateConfigEntry {
  label: string;
  headers: string[];
  filename: string;
}

export const TEMPLATE_CONFIG: Record<string, TemplateConfigEntry> = {
  tarefas: { label: 'Tarefas', headers: TEMPLATE_HEADERS, filename: 'sprint-board-modelo.csv' },
  lista: { label: 'Lista extra', headers: EXTRA_LIST_TEMPLATE_HEADERS, filename: 'sprint-board-modelo-lista.csv' },
};
