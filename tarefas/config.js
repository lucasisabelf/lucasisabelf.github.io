const APP_VERSION = '1.21';

const SHEET_NAMES = ['To Do', 'In Progress', 'Done'];
const COLUMN_BODIES = ['body-todo', 'body-progress', 'body-done'];

const SHEETS_MAP = {
  'Lucas': 'https://docs.google.com/spreadsheets/d/1pwp4yeXAGXXghSW_tR9gqeaDI0vOOBmuL3-hYKsnzmk/edit?usp=sharing',
  'Aline': 'https://docs.google.com/spreadsheets/d/1PrSsBgK5M0SoxYM2cJk7_GpIieNKzbeF2NQQmahvtpk/edit?usp=sharing'
};

const LISTS_SHEET_NAME = 'Listas';
const LISTS_RANGE = 'A1:A';
const LISTS_HEADER = 'lista';

const EXTRA_LIST_RANGE = 'A1:E';
const EXTRA_LIST_HEADER = 'nome';

const TEMPLATE_HEADERS = ['Título', 'Descrição', 'Data', 'Prioridade'];
const EXTRA_LIST_TEMPLATE_HEADERS = ['Nome', 'Tópico', 'Prioridade', 'Status', 'Motivo'];

const TEMPLATE_CONFIG = {
  tarefas: { label: 'Tarefas', headers: TEMPLATE_HEADERS, filename: 'sprint-board-modelo.csv' },
  lista: { label: 'Lista extra', headers: EXTRA_LIST_TEMPLATE_HEADERS, filename: 'sprint-board-modelo-lista.csv' }
};
