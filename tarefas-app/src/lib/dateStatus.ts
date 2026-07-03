import { parsePtBrDate } from './date';

export type DateStatus = 'overdue' | 'today' | 'warning' | 'invalid' | 'normal';

export interface DateInfo {
  status: DateStatus;
  text: string;
  title: string;
  overdueStage: number;
}

const DAYS_UNTIL_WARNING = 3;
const MS_PER_DAY = 86400000;
const OVERDUE_STAGES = [
  { minDays: 14, stage: 4 },
  { minDays: 7, stage: 3 },
  { minDays: 3, stage: 2 },
  { minDays: 1, stage: 1 },
];

function overdueStage(daysLate: number): number {
  for (const { minDays, stage } of OVERDUE_STAGES) {
    if (daysLate >= minDays) return stage;
  }
  return 0;
}

/** null quando não há data — nesse caso não existe badge de data pra mostrar. */
export function getDateInfo(date: string): DateInfo | null {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsed = parsePtBrDate(date);

  if (!parsed) {
    return { status: 'invalid', text: date, title: 'Formato de data não reconhecido — use DD/MM/AAAA', overdueStage: 0 };
  }

  const delta = Math.round((parsed.getTime() - today.getTime()) / MS_PER_DAY);

  let status: DateStatus = 'normal';
  if (parsed < today) {
    status = 'overdue';
  } else if (delta === 0) {
    status = 'today';
  } else {
    const warningThreshold = new Date();
    warningThreshold.setDate(warningThreshold.getDate() + DAYS_UNTIL_WARNING);
    if (parsed > today && parsed <= warningThreshold) status = 'warning';
  }

  const text =
    delta > 0
      ? `${date} · em ${delta} dia${delta !== 1 ? 's' : ''}`
      : delta < 0
        ? `${date} · há ${Math.abs(delta)} dia${Math.abs(delta) !== 1 ? 's' : ''}`
        : date;

  const title = parsed.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const stage = delta < 0 ? overdueStage(Math.abs(delta)) : 0;

  return { status, text, title, overdueStage: stage };
}
