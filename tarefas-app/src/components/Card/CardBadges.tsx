import type { CardData } from '../../types/card';
import type { CardFilterHandlers } from '../../types/handlers';
import { getDateInfo } from '../../lib/dateStatus';
import { RECURRENCE_OPTIONS } from '../../lib/recurrence';

const PRIORITY_CLASS: Record<string, string> = {
  Alta: 'bg-priority-high-bg text-priority-high-color',
  Média: 'bg-priority-mid-bg text-priority-mid-color',
  Baixa: 'bg-badge-bg text-empty-col',
};

const DATE_STATUS_CLASS: Record<string, string> = {
  overdue: 'bg-overdue-bg text-overdue-color',
  warning: 'bg-warning-bg text-warning-color',
  today: 'bg-today-bg text-today-color',
  invalid: 'text-error-color underline decoration-dotted',
  normal: '',
};

type CardBadgesProps = Pick<CardData, 'date' | 'priority' | 'recurrence' | 'responsavel' | 'tags'> &
  CardFilterHandlers & { activeFilter?: string };

export function CardBadges({ date, priority, recurrence, responsavel, tags, onFilterByPriority, onFilterByTag, activeFilter }: CardBadgesProps) {
  const dateInfo = getDateInfo(date);

  return (
    <>
      {dateInfo && (
        <span
          className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium bg-badge-bg text-text-card-date ${DATE_STATUS_CLASS[dateInfo.status]}`}
          title={dateInfo.title}
        >
          {dateInfo.text}
        </span>
      )}

      {priority && PRIORITY_CLASS[priority] && (
        <button
          type="button"
          className={`inline-block mt-2 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold cursor-pointer ${PRIORITY_CLASS[priority]} ${activeFilter === priority ? 'ring-2 ring-blue' : ''}`}
          onClick={() => onFilterByPriority(priority)}
        >
          {priority}
        </button>
      )}

      {recurrence && RECURRENCE_OPTIONS[recurrence] && (
        <span className="inline-block mt-2 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold bg-badge-bg text-text-card-date">
          {RECURRENCE_OPTIONS[recurrence].badge}
        </span>
      )}

      {responsavel && (
        <span className="inline-block mt-2 ml-2 rounded-full px-2 py-0.5 text-xs font-medium bg-badge-bg text-text-muted">
          {responsavel}
        </span>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`rounded-full px-2 py-0.5 text-xs font-medium bg-badge-bg text-text-muted cursor-pointer ${activeFilter === tag ? 'ring-2 ring-blue' : ''}`}
              onClick={() => onFilterByTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
