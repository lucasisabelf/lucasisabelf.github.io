import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewTaskModal } from './NewTaskModal';

describe('NewTaskModal', () => {
  it('blocks submit and marks the name field invalid when name is empty', async () => {
    const onSubmit = vi.fn();
    render(<NewTaskModal onClose={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByText('Adicionar'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a structured draft with the chosen recurrence', async () => {
    const onSubmit = vi.fn();
    render(<NewTaskModal onClose={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Revisar backlog');
    await userEvent.click(screen.getByLabelText('Repetir'));
    await userEvent.click(await screen.findByText('Semanalmente'));
    await userEvent.click(screen.getByText('Adicionar'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Revisar backlog', recurrence: 'semanal' });
  });

  it('prefills fields from a duplicated card', () => {
    render(
      <NewTaskModal
        prefill={{ name: 'Tarefa (cópia)', desc: 'desc original', priority: 'Alta', recurrence: 'mensal' }}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Nome')).toHaveValue('Tarefa (cópia)');
    expect(screen.getByLabelText('Descrição')).toHaveValue('desc original');
    expect(screen.getByLabelText('Repetir')).toHaveTextContent('Mensalmente');
  });

  it('shows edit title and Salvar button in edit mode', async () => {
    const onSubmit = vi.fn();
    render(<NewTaskModal mode="edit" prefill={{ name: 'Existente', date: '2026-10-20' }} onClose={vi.fn()} onSubmit={onSubmit} />);
    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Salvar'));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Existente', date: '2026-10-20' }));
  });
});
