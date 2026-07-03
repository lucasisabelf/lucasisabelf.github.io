import type { ColumnData } from '../../types/card';
import type { CardActionHandlers, CardDetailHandlers, CardFilterHandlers, CardSelectionHandlers } from '../../types/handlers';
import { Card } from '../Card/Card';

const HEADER_CLASS: Record<string, string> = {
  todo: 'bg-[#3b82f6] text-white',
  progress: 'bg-[#f59e0b] text-white',
  done: 'bg-[#10b981] text-white',
};

interface ColumnProps
  extends ColumnData,
    CardActionHandlers,
    CardFilterHandlers,
    CardDetailHandlers,
    Partial<CardSelectionHandlers> {
  expandActions: boolean;
  readonly: boolean;
  activeFilter?: string;
  onCreateTask?: () => void;
  selectedTitles?: Set<string>;
  newTitles?: Set<string>;
  daysByTitle?: Map<string, number>;
}

export function Column(props: ColumnProps) {
  const { id, title, cards, onCreateTask, selectedTitles, newTitles, daysByTitle, onToggleSelect, ...cardHandlers } = props;

  return (
    <div className="surface-panel flex flex-col overflow-hidden self-start">
      <div className={`px-4 py-3 font-bold text-[0.95rem] tracking-wide select-none ${HEADER_CLASS[id] ?? ''}`}>
        {title}
        {cards.length > 0 ? ` (${cards.length})` : ''}
      </div>
      <div className="column-scroll flex flex-col gap-2.5 p-3 min-h-[60px] max-h-[70vh] overflow-y-auto">
        {cards.length === 0 ? (
          <div className="text-center text-sm text-empty-col py-2">
            Nenhuma tarefa
            {onCreateTask && (
              <button type="button" className="block mx-auto mt-1.5 text-blue underline text-[0.78rem] bg-transparent border-0 cursor-pointer" onClick={onCreateTask}>
                + Nova Tarefa
              </button>
            )}
          </div>
        ) : (
          cards.map((card) => (
            <Card
              key={card.title}
              {...card}
              {...cardHandlers}
              onToggleSelect={onToggleSelect}
              selected={selectedTitles?.has(card.title) ?? false}
              isNew={newTitles?.has(card.title) ?? card.isNew}
              daysInColumn={daysByTitle?.get(card.title) ?? card.daysInColumn}
              isDoneColumn={id === 'done'}
            />
          ))
        )}
      </div>
    </div>
  );
}
