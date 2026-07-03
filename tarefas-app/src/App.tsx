import { useEffect, useMemo, useRef, useState } from 'react';
import { useSheetData } from './hooks/useSheetData';
import { useViewPreferences } from './hooks/useViewPreferences';
import { useSelection } from './hooks/useSelection';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useExtraLists } from './hooks/useExtraLists';
import { useActivityLog } from './hooks/useActivityLog';
import { useRecentSheets } from './hooks/useRecentSheets';
import { useLocalStorageBoolean, useLocalStorageString } from './hooks/useLocalStorageState';
import { SheetUrlForm } from './components/Header/SheetUrlForm';
import { FilterBar } from './components/Header/FilterBar';
import { ViewToggles } from './components/Header/ViewToggles';
import { HeaderMenus } from './components/Header/HeaderMenus';
import { Board } from './components/Board/Board';
import { BulkActionsBar } from './components/Board/BulkActionsBar';
import { ExtraListPanel } from './components/panels/ExtraListPanel';
import { ActivityPanel } from './components/panels/ActivityPanel';
import { NewTaskModal, type NewTaskPrefill } from './components/modals/NewTaskModal';
import { CardDetailModal } from './components/modals/CardDetailModal';
import { HelpModal } from './components/modals/HelpModal';
import { PasteHintBanner } from './components/PasteHintBanner';
import type { CardData } from './types/card';
import { STORAGE_KEYS } from './lib/storageKeys';
import { filterCards } from './lib/filterCards';
import { sortCards, SORT_MODES, type SortMode } from './lib/sortCards';
import { buildCardSummaryText } from './lib/format';
import { buildWhatsAppUrl, buildBoardWhatsAppUrl } from './lib/exporters/whatsapp';
import { buildCalendarUrl } from './lib/exporters/calendar';
import { buildAskClaudeText } from './lib/exporters/askClaude';
import { buildCardRowCsv, buildBoardCsv, buildTemplateCsv } from './lib/exporters/csv';
import { buildBoardText } from './lib/exporters/markdown';
import { buildBoardJson } from './lib/exporters/json';
import { buildIcsCalendar } from './lib/exporters/ics';
import { toIsoDate } from './lib/date';
import { nextRecurrenceDate } from './lib/recurrence';
import { TEMPLATE_CONFIG } from './lib/config';

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob(['﻿' + content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function App() {
  const sheetData = useSheetData();
  const { columns, state, errorMessage } = sheetData;
  const view = useViewPreferences();
  const selection = useSelection();
  const { theme, toggleTheme } = useTheme();
  const extraLists = useExtraLists();
  const activity = useActivityLog();
  const recentSheets = useRecentSheets();
  const [dyslexicFont, setDyslexicFont] = useLocalStorageBoolean('dyslexicFont', false);
  const [mode, setMode] = useLocalStorageString('mode', 'tarefas');

  const urlParams = useMemo(() => new URLSearchParams(location.search), []);
  const [readonly] = useState(() => urlParams.get('readonly') === '1');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshIntervalMin, setRefreshIntervalMin] = useState(5);

  const [sheetUrl, setSheetUrl] = useState(() => urlParams.get('sheet') || localStorage.getItem('lastSheet') || '');
  const [query, setQuery] = useState(() => urlParams.get('filter') || '');
  const [responsavelFilter, setResponsavelFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>(() => (localStorage.getItem('sortMode') as SortMode) || 'original');

  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTaskPrefill, setNewTaskPrefill] = useState<NewTaskPrefill | undefined>(undefined);
  const [detailCard, setDetailCard] = useState<CardData | null>(null);
  const [pasteHintVisible, setPasteHintVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);

  const filterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.dataset.dyslexicFont = dyslexicFont ? 'true' : undefined;
  }, [dyslexicFont]);

  async function handleLoad(url: string) {
    const result = await sheetData.load(url);
    if (!result) return;
    activity.track(result.columns);
    extraLists.load(result.id);
    localStorage.setItem('lastSheet', url);
    recentSheets.save(url);
    selection.reset();
    const params = new URLSearchParams();
    params.set('sheet', url);
    history.replaceState(null, '', `?${params.toString()}`);
  }

  useEffect(() => {
    if (sheetUrl) handleLoad(sheetUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoRefresh || !sheetUrl) return;
    const timer = setInterval(() => handleLoad(sheetUrl), refreshIntervalMin * 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshIntervalMin, sheetUrl]);

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

  useEffect(() => {
    localStorage.setItem('sortMode', sortMode);
  }, [sortMode]);

  useEffect(() => {
    history.replaceState(null, '', `${location.pathname}?${(() => {
      const params = new URLSearchParams(location.search);
      if (query) params.set('filter', query);
      else params.delete('filter');
      return params.toString();
    })()}`);
  }, [query]);

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

  function handleOpenDetail(card: CardData) {
    setDetailCard(card);
  }

  function detailColumnTitle(card: CardData): string {
    return displayColumns.find((col) => col.cards.some((c) => c.title === card.title))?.title ?? '';
  }

  function handleDuplicate(card: CardData) {
    const date = card.recurrence ? nextRecurrenceDate(card.date, card.recurrence) : toIsoDate(card.date);
    setNewTaskPrefill({ name: `${card.title} (cópia)`, desc: card.desc, date, priority: card.priority, recurrence: card.recurrence ?? '' });
    setNewTaskModalOpen(true);
  }

  function handleNewTaskSubmit(tsvRow: string) {
    navigator.clipboard.writeText(tsvRow).then(() => {
      window.open(sheetUrl);
      setNewTaskModalOpen(false);
      setNewTaskPrefill(undefined);
      setPasteHintVisible(true);
    });
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

  function handleCopyBoardLink() {
    if (!sheetUrl) return;
    const url = `${location.origin}${location.pathname}?sheet=${encodeURIComponent(sheetUrl)}`;
    navigator.clipboard.writeText(url);
  }

  function handleCopySheetUrl() {
    navigator.clipboard.writeText(sheetUrl);
  }

  function handleShareWhatsApp() {
    if (!sheetUrl) return;
    const url = `${location.origin}${location.pathname}?sheet=${encodeURIComponent(sheetUrl)}`;
    window.open(buildBoardWhatsAppUrl(url));
  }

  function handleExportText() {
    navigator.clipboard.writeText(buildBoardText(displayColumns));
  }

  function handleDownloadMd() {
    downloadBlob(buildBoardText(displayColumns), 'sprint-board.md', 'text/plain');
  }

  function handleDownloadJson() {
    downloadBlob(JSON.stringify(buildBoardJson(displayColumns), null, 2), 'sprint-board.json', 'application/json');
  }

  function handleDownloadCsv() {
    downloadBlob(buildBoardCsv(displayColumns), 'sprint-board.csv', 'text/csv;charset=utf-8');
  }

  function handleDownloadIcs() {
    const events = displayColumns.flatMap((c) => c.cards).filter((c) => c.date).map((c) => ({ title: c.title, desc: c.desc, date: c.date }));
    downloadBlob(buildIcsCalendar(events), 'sprint-board.ics', 'text/calendar;charset=utf-8');
  }

  function handleDownloadTemplate(type: string) {
    const entry = TEMPLATE_CONFIG[type];
    downloadBlob(buildTemplateCsv(entry.headers), entry.filename, 'text/csv;charset=utf-8');
  }

  function handleResetSettings() {
    if (!confirm('Limpar todas as configurações e recarregar a página?')) return;
    STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    location.reload();
  }

  useKeyboardShortcuts({
    boardVisible: state === 'success',
    onRefresh: () => handleLoad(sheetUrl),
    onFocusFilter: () => filterInputRef.current?.focus(),
    onNewTask: () => {
      setNewTaskPrefill(undefined);
      setNewTaskModalOpen(true);
    },
    onToggleCompact: () => view.setCompact(!view.compact),
    onToggleTheme: toggleTheme,
    onCycleSort: () => setSortMode(SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length]),
    onToggleSelectMode: selection.toggleSelectMode,
    onToggleHelp: () => setHelpOpen((o) => !o),
    onPrint: () => window.print(),
    onEscape: () => {
      if (newTaskModalOpen) {
        setNewTaskModalOpen(false);
        return;
      }
      if (detailCard) {
        setDetailCard(null);
        return;
      }
      if (helpOpen) {
        setHelpOpen(false);
        return;
      }
      if (document.activeElement === filterInputRef.current && query) setQuery('');
    },
  });

  return (
    <main className="max-w-6xl mx-auto p-4">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Sprint Board {readonly && <span className="text-xs font-normal text-text-muted">🔒 Somente leitura</span>}
          </h1>
          <div className="flex gap-2">
            <button type="button" className="text-lg" title="Atalhos de teclado" onClick={() => setHelpOpen(true)}>
              ?
            </button>
            <button type="button" className="text-lg" title="Alternar tema (T)" onClick={toggleTheme}>
              {theme === 'dark' ? '☾' : '☀'}
            </button>
            <button
              type="button"
              className="text-lg"
              title="Fonte para disléxicos"
              onClick={() => setDyslexicFont(!dyslexicFont)}
            >
              ⚑
            </button>
          </div>
        </div>
        <div className="no-print">
        <SheetUrlForm value={sheetUrl} onChange={setSheetUrl} onSubmit={handleLoad} loading={state === 'loading'} recentSheets={recentSheets.recent} />
        {state === 'success' && (
          <>
            {(mode !== 'tarefas' || extraLists.lists.length > 0) && (
              <select
                className="mt-2 border border-border-input rounded px-2 py-1.5 bg-surface text-text"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="tarefas">Tarefas</option>
                {extraLists.lists.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.name} ({l.items.length})
                  </option>
                ))}
              </select>
            )}
            {mode === 'tarefas' && (
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
                <HeaderMenus
                  onCopyBoardLink={handleCopyBoardLink}
                  onCopySheetUrl={handleCopySheetUrl}
                  onShareWhatsApp={handleShareWhatsApp}
                  onExportText={handleExportText}
                  onDownloadMd={handleDownloadMd}
                  onDownloadJson={handleDownloadJson}
                  onDownloadCsv={handleDownloadCsv}
                  onDownloadIcs={handleDownloadIcs}
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    className="text-xs rounded px-2 py-1 border border-border-input"
                    onClick={() => {
                      setActivityPanelOpen((o) => !o);
                      if (!activityPanelOpen) activity.markSeen();
                    }}
                  >
                    Atividade{activity.unseenCount > 0 ? ` (${activity.unseenCount})` : ''}
                  </button>
                  {!readonly && (
                    <button
                      type="button"
                      className={`text-xs rounded px-2 py-1 border border-border-input ${selection.selectMode ? 'bg-blue text-white border-blue' : ''}`}
                      onClick={selection.toggleSelectMode}
                    >
                      Selecionar
                    </button>
                  )}
                  <label className="text-xs flex items-center gap-1">
                    <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                    Auto-refresh
                  </label>
                  <select
                    className="text-xs rounded px-1 py-1 border border-border-input bg-surface text-text"
                    value={refreshIntervalMin}
                    onChange={(e) => setRefreshIntervalMin(Number(e.target.value))}
                  >
                    <option value={1}>1 min</option>
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                  </select>
                </div>
                {selection.selectMode && !readonly && (
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
          </>
        )}
        </div>
      </header>

      {pasteHintVisible && <PasteHintBanner onDismiss={() => setPasteHintVisible(false)} />}
      {activityPanelOpen && mode === 'tarefas' && (
        <div className="mt-3">
          <ActivityPanel log={activity.log} />
        </div>
      )}

      {state === 'idle' && (
        <div className="mt-6 text-center text-text-muted">Insira o link da planilha acima para começar.</div>
      )}
      {state === 'loading' && <div className="mt-6 text-center text-text-muted">Carregando...</div>}
      {state === 'error' && (
        <div className="mt-6 text-center text-error-color bg-error-bg border border-error-border rounded p-3">
          {errorMessage}
        </div>
      )}
      {state === 'success' && mode === 'tarefas' && (
        <div className="mt-4">
          <Board
            columns={displayColumns}
            expandActions={view.expandActions}
            focus={view.focus}
            readonly={readonly}
            activeFilter={activeFilter}
            selectedTitles={selection.selectMode ? selection.selectedTitles : undefined}
            onToggleSelect={selection.selectMode ? selection.toggleTitle : undefined}
            newTitles={activity.newTitles}
            daysByTitle={view.columnTimeVisible ? activity.daysByTitle : undefined}
            onFilterByPriority={toggleQueryFilter}
            onFilterByTag={toggleQueryFilter}
            onOpenDetail={handleOpenDetail}
            onCopy={handleCopy}
            onDuplicate={handleDuplicate}
            onWhatsApp={handleWhatsApp}
            onCalendar={handleCalendar}
            onAskClaude={handleAskClaude}
            onCreateTask={
              readonly
                ? undefined
                : () => {
                    setNewTaskPrefill(undefined);
                    setNewTaskModalOpen(true);
                  }
            }
          />
        </div>
      )}
      {state === 'success' && mode !== 'tarefas' && (
        <div className="mt-4">
          <ExtraListPanel name={mode} items={extraLists.lists.find((l) => l.name === mode)?.items ?? []} />
        </div>
      )}

      {newTaskModalOpen && (
        <NewTaskModal
          prefill={newTaskPrefill}
          onClose={() => setNewTaskModalOpen(false)}
          onSubmit={handleNewTaskSubmit}
        />
      )}
      {detailCard && (
        <CardDetailModal card={detailCard} columnTitle={detailColumnTitle(detailCard)} onClose={() => setDetailCard(null)} />
      )}
      {helpOpen && (
        <HelpModal onClose={() => setHelpOpen(false)} onDownloadTemplate={handleDownloadTemplate} onResetSettings={handleResetSettings} />
      )}
    </main>
  );
}

export default App;
