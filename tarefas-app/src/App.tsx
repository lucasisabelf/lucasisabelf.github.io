import { useSheetData } from './hooks/useSheetData';
import { SheetUrlForm } from './components/Header/SheetUrlForm';
import { Board } from './components/Board/Board';
import type { CardData } from './types/card';

// Handlers reais chegam nas Fases 4/5 (filtro, modal de detalhe, exportações).
// Ficam centralizados aqui por enquanto pra não duplicar a assinatura em cada
// call site — Board/Column/Card só dependem da interface (ISP), não de onde
// vem a implementação.
function noop() {}
function noopCard(_card: CardData) {}

function App() {
  const { columns, state, errorMessage, load } = useSheetData();

  return (
    <main className="max-w-6xl mx-auto p-4">
      <header>
        <h1 className="text-xl font-bold">Sprint Board</h1>
        <SheetUrlForm onSubmit={load} loading={state === 'loading'} />
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
            columns={columns}
            expandActions={false}
            focus={false}
            readonly={false}
            onFilterByPriority={noop}
            onFilterByTag={noop}
            onOpenDetail={noopCard}
            onCopy={noopCard}
            onDuplicate={noopCard}
            onWhatsApp={noopCard}
            onCalendar={noopCard}
            onAskClaude={noopCard}
          />
        </div>
      )}
    </main>
  );
}

export default App;
