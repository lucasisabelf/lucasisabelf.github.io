import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

const baseProps = {
  title: 'Tarefa recorrente',
  desc: 'Descrição',
  date: '01/01/2026',
  priority: 'Alta' as const,
  responsavel: 'Lucas',
  link: '',
  tags: ['sprint', 'urgente'],
  recurrence: 'semanal' as const,
  expandActions: false,
  readonly: false,
  onOpenDetail: vi.fn(),
  onFilterByPriority: vi.fn(),
  onFilterByTag: vi.fn(),
  onCopy: vi.fn(),
  onDuplicate: vi.fn(),
  onWhatsApp: vi.fn(),
  onCalendar: vi.fn(),
  onAskClaude: vi.fn(),
};

describe('Card', () => {
  it('renders title, priority, recurrence badge and tags', () => {
    render(<Card {...baseProps} />);
    expect(screen.getByText('Tarefa recorrente')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('🔁 Semanal')).toBeInTheDocument();
    expect(screen.getByText('sprint')).toBeInTheDocument();
    expect(screen.getByText('urgente')).toBeInTheDocument();
  });

  it('does not render a Duplicar action in readonly mode (modo "ver todas as ações")', () => {
    render(<Card {...baseProps} expandActions readonly />);
    expect(screen.queryByText('Duplicar')).not.toBeInTheDocument();
  });

  it('shows Duplicar when not readonly (modo "ver todas as ações")', () => {
    render(<Card {...baseProps} expandActions readonly={false} />);
    expect(screen.getByText('Duplicar')).toBeInTheDocument();
  });

  it('reveals the "Mais" dropdown panel on click (regressão de FALHAS.md #004)', async () => {
    render(<Card {...baseProps} expandActions={false} />);
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Mais ▾'));
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Duplicar')).toBeInTheDocument();
  });

  it('calls onOpenDetail with the card data when the title is clicked', async () => {
    const onOpenDetail = vi.fn();
    render(<Card {...baseProps} onOpenDetail={onOpenDetail} />);
    await userEvent.click(screen.getByText('Tarefa recorrente'));
    expect(onOpenDetail).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Tarefa recorrente', recurrence: 'semanal' }),
    );
  });
});
