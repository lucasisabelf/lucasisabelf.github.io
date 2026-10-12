import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtraListPanel } from './ExtraListPanel';

const item = { nome: 'Livro X', topico: 'Leitura', prioridade: 'Alta', status: 'Lendo', motivo: '' };

describe('ExtraListPanel', () => {
  it('hides edit actions when no handlers are passed', () => {
    render(<ExtraListPanel name="Livros" items={[item]} />);
    expect(screen.queryByText('Novo item')).not.toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });

  it('calls the item handlers', async () => {
    const onCreateItem = vi.fn();
    const onEditItem = vi.fn();
    const onDeleteItem = vi.fn();
    render(<ExtraListPanel name="Livros" items={[item]} onCreateItem={onCreateItem} onEditItem={onEditItem} onDeleteItem={onDeleteItem} />);
    await userEvent.click(screen.getByText('Novo item'));
    await userEvent.click(screen.getByText('Editar'));
    await userEvent.click(screen.getByText('Excluir'));
    expect(onCreateItem).toHaveBeenCalled();
    expect(onEditItem).toHaveBeenCalledWith(item);
    expect(onDeleteItem).toHaveBeenCalledWith(item);
  });
});
