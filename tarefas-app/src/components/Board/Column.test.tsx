import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Column } from './Column';
import { CARD_DRAG_MIME, serializeDraggedCard } from '../../lib/dragCard';
import type { CardData } from '../../types/card';

const card: CardData = { title: 'Arrastada', desc: '', date: '01/01/2026', priority: '', responsavel: '', link: '', tags: [], recurrence: null };

const handlers = {
  expandActions: false,
  readonly: false,
  compact: true,
  onOpenDetail: vi.fn(),
  onFilterByPriority: vi.fn(),
  onFilterByTag: vi.fn(),
  onCopy: vi.fn(),
  onDuplicate: vi.fn(),
  onWhatsApp: vi.fn(),
  onCalendar: vi.fn(),
  onAskClaude: vi.fn(),
  onToggleCollapse: vi.fn(),
  onCopyColumnText: vi.fn(),
  onCopyColumnCsv: vi.fn(),
};

function dataTransfer(payload: string) {
  return { types: [CARD_DRAG_MIME], getData: () => payload, dropEffect: '' };
}

describe('Column drag and drop', () => {
  it('calls onMove when a card from another column is dropped', () => {
    const onMove = vi.fn();
    render(<Column id="done" title="Done" cards={[]} {...handlers} onEdit={vi.fn()} onMove={onMove} onDelete={vi.fn()} />);
    fireEvent.drop(screen.getByText('Nenhuma tarefa'), { dataTransfer: dataTransfer(serializeDraggedCard(card, 'todo')) });
    expect(onMove).toHaveBeenCalledWith(card, 'todo', 'done');
  });

  it('ignores drops on the same column', () => {
    const onMove = vi.fn();
    render(<Column id="todo" title="To Do" cards={[]} {...handlers} onEdit={vi.fn()} onMove={onMove} onDelete={vi.fn()} />);
    fireEvent.drop(screen.getByText('Nenhuma tarefa'), { dataTransfer: dataTransfer(serializeDraggedCard(card, 'todo')) });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('makes cards draggable only when move is available', () => {
    const { rerender, container } = render(<Column id="todo" title="To Do" cards={[card]} {...handlers} />);
    expect(container.querySelector('[draggable="true"]')).toBeNull();
    rerender(<Column id="todo" title="To Do" cards={[card]} {...handlers} onEdit={vi.fn()} onMove={vi.fn()} onDelete={vi.fn()} />);
    expect(container.querySelector('[draggable="true"]')).not.toBeNull();
  });
});
