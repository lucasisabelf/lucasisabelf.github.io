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

  it('embeds the recurrence marker in the description when a recurrence is chosen', async () => {
    const onSubmit = vi.fn();
    render(<NewTaskModal onClose={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Nome'), 'Revisar backlog');
    await userEvent.selectOptions(screen.getByLabelText('Repetir'), 'semanal');
    await userEvent.click(screen.getByText('Adicionar'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const tsv = onSubmit.mock.calls[0][0] as string;
    expect(tsv).toContain('Revisar backlog');
    expect(tsv).toContain('[repete:semanal]');
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
    expect(screen.getByLabelText('Repetir')).toHaveValue('mensal');
  });
});
