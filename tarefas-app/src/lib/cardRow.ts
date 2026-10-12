import type { CardData, TaskDraft } from '../types/card';
import { buildRecurrenceMarker } from './recurrence';
import { toPtBrDate } from './date';

function descWithRecurrence(desc: string, recurrence: CardData['recurrence'] | ''): string {
  return recurrence ? `${desc}${desc ? '\n' : ''}${buildRecurrenceMarker(recurrence)}` : desc;
}

/** Inverso de mapCardRow: as 7 colunas (A:G) da linha na planilha. */
export function cardToRow(card: CardData): string[] {
  return [
    card.title,
    descWithRecurrence(card.desc, card.recurrence),
    card.date,
    card.priority,
    card.responsavel,
    card.link,
    card.tags.join(', '),
  ];
}

/** Aplica o rascunho do modal sobre um card — `base` preserva os campos que o modal não edita (responsável, link, tags). */
export function draftToCard(draft: TaskDraft, base?: CardData): CardData {
  return {
    title: draft.name.trim(),
    desc: draft.desc,
    date: toPtBrDate(draft.date) || new Date().toLocaleDateString('pt-BR'),
    priority: draft.priority,
    responsavel: base?.responsavel ?? '',
    link: base?.link ?? '',
    tags: base?.tags ?? [],
    recurrence: draft.recurrence || null,
  };
}

/** Linha TSV pro fluxo sem gravação direta (copiar e colar na planilha). */
export function draftToTsv(draft: TaskDraft): string {
  return cardToRow(draftToCard(draft)).slice(0, 4).join('\t');
}
