import type { CardData } from './card';

/**
 * Interfaces segregadas por papel de consumidor (ISP): cada componente recebe só
 * o subconjunto de comportamento que efetivamente usa, nunca um CardProps único
 * com todo callback possível. Ver CLAUDE.md para o racional completo.
 */

/** Só existe (e só é passada) quando o board está em modo seleção. */
export interface CardSelectionHandlers {
  selected: boolean;
  onToggleSelect(title: string): void;
}

/** Consumida só pela barra de ações do card (CardActions). */
export interface CardActionHandlers {
  onCopy(card: CardData): void;
  onDuplicate(card: CardData): void;
  onWhatsApp(card: CardData): void;
  onCalendar(card: CardData): void;
  onAskClaude(card: CardData): void;
}

/** Consumida só pelos badges clicáveis (CardBadges) — prioridade e tags filtram o board. */
export interface CardFilterHandlers {
  onFilterByPriority(priority: string): void;
  onFilterByTag(tag: string): void;
}

/** Consumida só pelo título do card (abre o modal de detalhe). */
export interface CardDetailHandlers {
  onOpenDetail(card: CardData): void;
}
