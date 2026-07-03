import { useMemo, useRef, useState } from 'react';
import { useSheetData } from './hooks/useSheetData';
import { useViewPreferences } from './hooks/useViewPreferences';
import { useSelection } from './hooks/useSelection';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SheetUrlForm } from './components/Header/SheetUrlForm';
import { FilterBar } from './components/Header/FilterBar';
import { ViewToggles } from './components/Header/ViewToggles';
import { Board } from './components/Board/Board';
import { BulkActionsBar } from './components/Board/BulkActionsBar';
import type { CardData } from './types/card';
import { filterCards } from './lib/filterCards';
import { sortCards, SORT_MODES, type SortMode } from './lib/sortCards';
import { buildCardSummaryText } from './lib/format';
import { buildWhatsAppUrl } from './lib/exporters/whatsapp';
import { buildCalendarUrl } from './lib/exporters/calendar';
import { buildAskClaudeText } from './lib/exporters/askClaude';
import { buildCardRowCsv } from './lib/exporters/csv';

function noopCard(_card: CardData) {}

function App() {
  const { columns, state, errorMessage, load } = useSheetData();
  const view = useViewPreferences();
  const selection = useSelection();
  const { theme, toggleTheme } = useTheme();

  const [sheetUrl, setSheetUrl] = useState('');
  const [query, setQuery] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('original');

  const filterInputRef = useRef<HTMLInputElement>(null);

  const responsavelOptions = useMemo(() => {
    const counts = new Map<string, number>();
    columns.forEach((col) => col.cards.forEach((c) => {
      if (c.responsavel) counts.set(c.responsavel, (counts.get(c.responsavel) || 0) + 1);
    }));
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [columns]);

  const displayColumns = useMemo(
    () => columns.map((col) => ({ ...col, cards: sortCards(filterCards(col.cards, query, responsavelFilter), sortMode) })),
    [columns, query, responsavelFilter, sortMode],
  );

  const totalCount = useMemo(() => columns.reduce((sum, c) => sum + c.cards.length, 0), [columns]);
  const visibleCount = useMemo(() => displayColumns.reduce((sum, c) => sum + c.cards.length, 0), [displayColumns]);
  const visibleTitles = useMemo(() => displayColumns.flatMap((c) => c.cards.map((card) => card.title)), [displayColumns]);

  function toggleQueryFilter(value: string) {
    setQuery((current) => (current === value ? '' : value));
    setActiveFilter((current) => (current === value ? '' : value));
  }

  function handleCopy(card: CardData) {
    navigator.clipboard.writeText(buildCardSummaryText(card));
  }

  function handleWhatsApp(card: CardData) {
    window.open(buildWhatsAppUrl(card));
  }

  function handleCalendar(card: CardData) {
    window.open(buildCalendarUrl(card.title, card.desc, card.date));
  }

  function handleAskClaude(card: CardData) {
    navigator.clipboard.writeText(buildAskClaudeText(card)).then(() => window.open('https://claude.ai'));
  }

  function handleCopySelected() {
    const selected = displayColumns.flatMap((c) => c.cards).filter((c) => selection.selectedTitles.has(c.title));
    navigator.clipboard.writeText(selected.map(buildCardSummaryText).join('\n'));
  }

  function handleDownloadCsvSelected() {
    const rows = ['Coluna,Título,Descrição,Data,Prioridade,Responsável,Link,Tags'];
    displayColumns.forEach((col) => {
      col.cards.filter((c) => selection.selectedTitles.has(c.title)).forEach((c) => rows.push(buildCardRowCsv(c, col.title)));
    });
    downloadBlob(rows.join('\n'), 'sprint-board-selecionados.csv', 'text/csv;charset=utf-8');
  }

  function downloadBlob(content: string, filename: string, type: string) {
    const blob = new Blob(['﻿' + content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  useKeyboardShortcuts({
    boardVisible: state === 'success',
    onRefresh: () => load(sheetUrl),
    onFocusFilter: () => filterInputRef.current?.focus(),
    onNewTask: () => {},
    onToggleCompact: () => view.setCompact(!view.compact),
    onToggleTheme: toggleTheme,
    onCycleSort: () => setSortMode(SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length]),
    onToggleSelectMode: selection.toggleSelectMode,
    onToggleHelp: () => {},
    onEscape: () => {
      if (document.activeElement === filterInputRef.current && query) setQuery('');
    },
  });

  return (
    <main className="max-w-6xl mx-auto p-4">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Sprint Board</h1>
          <button type="button" className="text-lg" title="Alternar tema (T)" onClick={toggleTheme}>
            {theme === 'dark' ? '☾' : '☀'}
          </button>
        </div>
        <SheetUrlForm value={sheetUrl} onChange={setSheetUrl} onSubmit={load} loading={state === 'loading'} />
        {state === 'success' && (
          <>
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              responsavelFilter={responsavelFilter}
              onResponsavelFilterChange={setResponsavelFilter}
              responsavelOptions={responsavelOptions}
              visibleCount={visibleCount}
              totalCount={totalCount}
              inputRef={filterInputRef}
            />
            <ViewToggles
              compact={view.compact}
              onToggleCompact={() => view.setCompact(!view.compact)}
              focus={view.focus}
              onToggleFocus={() => view.setFocus(!view.focus)}
              columnTimeVisible={view.columnTimeVisible}
              onToggleColumnTime={() => view.setColumnTimeVisible(!view.columnTimeVisible)}
              expandActions={view.expandActions}
              onToggleExpandActions={() => view.setExpandActions(!view.expandActions)}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
            />
            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                className={`text-xs rounded px-2 py-1 border border-border-input ${selection.selectMode ? 'bg-blue text-white border-blue' : ''}`}
                onClick={selection.toggleSelectMode}
              >
                Selecionar
              </button>
            </div>
            {selection.selectMode && (
              <BulkActionsBar
                selectedCount={selection.selectedTitles.size}
                onSelectAll={() => selection.selectAll(visibleTitles)}
                onCopySelected={handleCopySelected}
                onDownloadCsvSelected={handleDownloadCsvSelected}
                onCancel={selection.toggleSelectMode}
              />
            )}
          </>
        )}
      </header>

      {state === 'idle' && (
        <div className="mt-6 text-center text-text-muted">Insira o link da planilha acima para começar.</div>
      )}
      {state === 'loading' && <div className="mt-6 text-center text-text-muted">Carregando...</div>}
      {state === 'error' && (
        <div className="mt-6 text-center text-error-color bg-error-bg border border-error-border rounded p-3">
          {errorMessage}
        </div>
      )}
      {state === 'success' && (
        <div className="mt-4">
          <Board
            columns={displayColumns}
            expandActions={view.expandActions}
            focus={view.focus}
            readonly={false}
            activeFilter={activeFilter}
            selectedTitles={selection.selectMode ? selection.selectedTitles : undefined}
            onToggleSelect={selection.selectMode ? selection.toggleTitle : undefined}
            onFilterByPriority={toggleQueryFilter}
            onFilterByTag={toggleQueryFilter}
            onOpenDetail={noopCard}
            onCopy={handleCopy}
            onDuplicate={noopCard}
            onWhatsApp={handleWhatsApp}
            onCalendar={handleCalendar}
            onAskClaude={handleAskClaude}
          />
        </div>
      )}
    </main>
  );
}

export default App;
