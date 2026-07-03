import type { CardData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardFilterHandlers, CardSelectionHandlers } from '../../types/handlers';
import { parseChecklist } from '../../lib/checklist';
import { getDateInfo } from '../../lib/dateStatus';
import { CardBadges } from './CardBadges';
import { CardActions } from './CardActions';

const PRIORITY_BORDER: Record<string, string> = {
  Alta: 'border-l-[3px] border-l-priority-high-color',
  Média: 'border-l-[3px] border-l-priority-mid-color',
  Baixa: 'border-l-[3px] border-l-empty-col',
};

interface CardProps
  extends CardData,
    CardActionHandlers,
    CardFilterHandlers,
    CardDetailHandlers,
    Partial<CardSelectionHandlers> {
  expandActions: boolean;
  readonly: boolean;
  activeFilter?: string;
  isDoneColumn?: boolean;
}

export function Card(props: CardProps) {
  const { title, desc, date, priority, responsavel, link, tags, recurrence, isNew, daysInColumn, expandActions, readonly, activeFilter, isDoneColumn } = props;
  const { onOpenDetail, onFilterByPriority, onFilterByTag, onCopy, onDuplicate, onWhatsApp, onCalendar, onAskClaude } = props;
  const checklist = parseChecklist(desc);
  const cardData: CardData = { title, desc, date, priority, responsavel, link, tags, recurrence };
  const dateInfo = getDateInfo(date);
  const overdueStage = !isDoneColumn && dateInfo ? dateInfo.overdueStage : 0;

  return (
    <div
      className={`card-surface relative bg-surface-card border rounded-lg p-3 ${responsavel ? 'border-border' : 'border-dashed border-border-input'} ${priority && PRIORITY_BORDER[priority] ? PRIORITY_BORDER[priority] : ''} ${overdueStage > 0 ? `bg-overdue-bg card-overdue-stage card-overdue-stage-${overdueStage}` : ''}`}
      tabIndex={0}
      role="button"
    >
      {props.onToggleSelect && (
        <input
          type="checkbox"
          className="absolute top-2.5 right-2.5"
          checked={props.selected}
          onChange={() => props.onToggleSelect!(title)}
        />
      )}

      {isNew && (
        <span className="inline-block mb-1 text-[0.68rem] font-bold uppercase text-feedback-color bg-feedback-bg rounded px-1.5 py-0.5">
          Novo
        </span>
      )}

      <div className="font-semibold text-[0.9rem] leading-snug text-text-card-title cursor-pointer" onClick={() => onOpenDetail(cardData)}>
        {title}
        {checklist && (
          <span className="ml-1.5 text-xs font-normal text-text-muted">
            {checklist.filter((i) => i.done).length}/{checklist.length}
          </span>
        )}
      </div>

      {checklist ? (
        <ul className="mt-1.5 text-[0.82rem] leading-relaxed text-text-muted list-none">
          {checklist.map((item, i) => (
            <li key={i}>
              {item.done ? '☑' : '☐'} {item.text}
            </li>
          ))}
        </ul>
      ) : (
        desc && <div className="mt-1.5 text-[0.82rem] leading-relaxed text-text-muted">{desc}</div>
      )}

      <CardBadges
        date={date}
        priority={priority}
        recurrence={recurrence}
        responsavel={responsavel}
        tags={tags}
        activeFilter={activeFilter}
        onFilterByPriority={onFilterByPriority}
        onFilterByTag={onFilterByTag}
      />

      {daysInColumn !== undefined && daysInColumn > 0 && (
        <span className="block mt-1.5 text-xs text-empty-col">
          há {daysInColumn} dia{daysInColumn !== 1 ? 's' : ''}
        </span>
      )}

      <CardActions
        card={cardData}
        expandActions={expandActions}
        readonly={readonly}
        onCopy={onCopy}
        onDuplicate={onDuplicate}
        onWhatsApp={onWhatsApp}
        onCalendar={onCalendar}
        onAskClaude={onAskClaude}
      />
    </div>
  );
}
