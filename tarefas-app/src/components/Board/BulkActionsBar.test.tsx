import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkActionsBar } from './BulkActionsBar';

const base = { onSelectAll: vi.fn(), onCopySelected: vi.fn(), onDownloadCsvSelected: vi.fn(), onCancel: vi.fn() };

describe('BulkActionsBar', () => {
  it('hides move/delete when edit is not configured', () => {
    render(<BulkActionsBar {...base} selectedCount={2} />);
    expect(screen.queryByText('Mover para')).not.toBeInTheDocument();
    expect(screen.queryByText('Excluir selecionados')).not.toBeInTheDocument();
  });

  it('moves and deletes the selection', async () => {
    const onMoveSelected = vi.fn();
    const onDeleteSelected = vi.fn();
    render(<BulkActionsBar {...base} selectedCount={2} onMoveSelected={onMoveSelected} onDeleteSelected={onDeleteSelected} />);
    await userEvent.click(screen.getByText('Mover para'));
    await userEvent.click(screen.getByText('Done'));
    expect(onMoveSelected).toHaveBeenCalledWith('done');
    await userEvent.click(screen.getByText('Excluir selecionados'));
    expect(onDeleteSelected).toHaveBeenCalled();
  });

  it('disables bulk edit actions with nothing selected', () => {
    render(<BulkActionsBar {...base} selectedCount={0} onMoveSelected={vi.fn()} onDeleteSelected={vi.fn()} />);
    expect(screen.getByText('Excluir selecionados')).toBeDisabled();
    expect(screen.getByText('Mover para').closest('button')).toBeDisabled();
  });
});
