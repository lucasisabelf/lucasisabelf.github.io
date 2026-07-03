import type { CardData } from '../../types/card';

export function buildAskClaudeText(card: Pick<CardData, 'title' | 'desc' | 'date'>): string {
  const { title, desc, date } = card;
  return `Estou trabalhando na tarefa: ${title}.${desc ? ' ' + desc : ''} ${date ? 'Prazo: ' + date + '.' : ''} Como você me ajudaria com essa tarefa?`;
}
