import { Modal } from '../Modal';
import type { CardData } from '../../types/card';
import { parseChecklist } from '../../lib/checklist';
import { parsePtBrDate } from '../../lib/date';

const MS_PER_DAY = 86400000;

interface CardDetailModalProps {
  card: CardData;
  columnTitle: string;
  onClose(): void;
}

export function CardDetailModal({ card, columnTitle, onClose }: CardDetailModalProps) {
  const checklist = parseChecklist(card.desc);

  let dateText = '';
  if (card.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsed = parsePtBrDate(card.date);
    const delta = parsed ? Math.round((parsed.getTime() - today.getTime()) / MS_PER_DAY) : null;
    const suffix =
      delta === null ? '' : delta > 0 ? ` · em ${delta} dia${delta !== 1 ? 's' : ''}` : delta < 0 ? ` · vencida há ${Math.abs(delta)} dia${Math.abs(delta) !== 1 ? 's' : ''}` : ' · hoje';
    dateText = `Data: ${card.date}${suffix}`;
  }

  return (
    <Modal
      onClose={onClose}
      title={card.title}
      footer={
        <button type="button" className="btn-outline" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className="space-y-2 text-sm">
        {checklist ? (
          <ul className="text-text-muted">
            {checklist.map((item, i) => (
              <li key={i}>
                {item.done ? '☑' : '☐'} {item.text}
              </li>
            ))}
          </ul>
        ) : (
          card.desc && <p className="text-text-muted">{card.desc}</p>
        )}
        <p className="text-text-muted">Coluna: {columnTitle}</p>
        {card.date && <p className="text-text-muted">{dateText}</p>}
        {card.priority && <p className="text-text-muted">Prioridade: {card.priority}</p>}
        {card.responsavel && <p className="text-text-muted">Responsável: {card.responsavel}</p>}
        {card.link && (
          <p className="text-text-muted">
            Link:{' '}
            <a className="text-blue underline" href={card.link} target="_blank" rel="noopener noreferrer">
              {card.link}
            </a>
          </p>
        )}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <span key={tag} className="rounded-full px-2 py-0.5 text-xs bg-badge-bg text-text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
