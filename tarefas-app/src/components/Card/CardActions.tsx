import type { CardData } from '../../types/card';
import type { CardActionHandlers } from '../../types/handlers';
import { DropdownMenu } from '../DropdownMenu';

const ACTION_BTN_CLASS = 'text-xs text-text-muted bg-transparent border-0 cursor-pointer p-0 hover:text-blue';

interface CardActionsProps extends CardActionHandlers {
  card: CardData;
  expandActions: boolean;
  readonly: boolean;
}

export function CardActions({ card, expandActions, readonly, onCopy, onDuplicate, onWhatsApp, onCalendar, onAskClaude }: CardActionsProps) {
  const moreButtons = (
    <>
      <button type="button" className={ACTION_BTN_CLASS} onClick={() => onAskClaude(card)}>
        Sugerir ao Claude
      </button>
      <button type="button" className={ACTION_BTN_CLASS} onClick={() => onCalendar(card)}>
        + Agenda
      </button>
      <button type="button" className={ACTION_BTN_CLASS} onClick={() => onWhatsApp(card)}>
        WhatsApp
      </button>
      {!readonly && (
        <button type="button" className={ACTION_BTN_CLASS} onClick={() => onDuplicate(card)}>
          Duplicar
        </button>
      )}
    </>
  );

  return (
    <div className="flex gap-2.5 mt-2 pt-1.5 border-t border-border">
      <button type="button" className={ACTION_BTN_CLASS} onClick={() => onCopy(card)}>
        Copiar
      </button>
      {card.link && (
        <a className={ACTION_BTN_CLASS} href={card.link} target="_blank" rel="noopener noreferrer">
          🔗
        </a>
      )}
      {expandActions ? (
        moreButtons
      ) : (
        <DropdownMenu label="Mais ▾" buttonClassName={ACTION_BTN_CLASS}>
          {moreButtons}
        </DropdownMenu>
      )}
    </div>
  );
}
