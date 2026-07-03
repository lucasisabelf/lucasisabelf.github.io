import { useState } from 'react';
import { Modal } from '../Modal';
import { toPtBrDate } from '../../lib/date';
import { buildRecurrenceMarker, RECURRENCE_OPTIONS } from '../../lib/recurrence';
import type { Priority, RecurrenceType } from '../../types/card';

const TASK_DESC_MAX = 300;

export interface NewTaskPrefill {
  name?: string;
  desc?: string;
  date?: string;
  priority?: Priority | '';
  recurrence?: RecurrenceType | '';
}

interface NewTaskModalProps {
  prefill?: NewTaskPrefill;
  onClose(): void;
  onSubmit(tsvRow: string): void;
}

export function NewTaskModal({ prefill, onClose, onSubmit }: NewTaskModalProps) {
  const [name, setName] = useState(prefill?.name ?? '');
  const [desc, setDesc] = useState(prefill?.desc ?? '');
  const [date, setDate] = useState(prefill?.date || new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Priority | ''>(prefill?.priority ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceType | ''>(prefill?.recurrence ?? '');
  const [nameInvalid, setNameInvalid] = useState(false);

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameInvalid(true);
      return;
    }
    const ptBrDate = toPtBrDate(date) || new Date().toLocaleDateString('pt-BR');
    const descWithRecurrence = recurrence ? `${desc}${desc ? '\n' : ''}${buildRecurrenceMarker(recurrence)}` : desc;
    const tsv = `${trimmedName}\t${descWithRecurrence}\t${ptBrDate}\t${priority}`;
    onSubmit(tsv);
  }

  return (
    <Modal
      onClose={onClose}
      title="Nova Tarefa"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            Adicionar
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className="block text-[0.85rem] font-semibold text-text-muted mb-1" htmlFor="task-name">
            Nome
          </label>
          <input
            id="task-name"
            className={`field-input w-full px-3.5 py-2 ${nameInvalid ? 'input--invalid' : ''}`}
            maxLength={80}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameInvalid(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <small className="block text-right text-[0.72rem] text-text-muted mt-0.5">{name.length} / 80</small>
        </div>
        <div>
          <label className="block text-[0.85rem] font-semibold text-text-muted mb-1" htmlFor="task-desc">
            Descrição
          </label>
          <textarea
            id="task-desc"
            className="field-input w-full px-3.5 py-2 resize-none"
            rows={3}
            maxLength={TASK_DESC_MAX}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
            }}
          />
          <small className="block text-right text-[0.72rem] text-text-muted mt-0.5">
            {desc.length} / {TASK_DESC_MAX}
          </small>
        </div>
        <div>
          <label className="block text-[0.85rem] font-semibold text-text-muted mb-1" htmlFor="task-date">
            Data
          </label>
          <input
            id="task-date"
            type="date"
            className="field-input w-full px-3.5 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[0.85rem] font-semibold text-text-muted mb-1" htmlFor="task-priority">
            Prioridade
          </label>
          <select
            id="task-priority"
            className="field-input w-full px-3.5 py-2 cursor-pointer"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
          >
            <option value="">Sem prioridade</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>
        <div>
          <label className="block text-[0.85rem] font-semibold text-text-muted mb-1" htmlFor="task-recurrence">
            Repetir
          </label>
          <select
            id="task-recurrence"
            className="field-input w-full px-3.5 py-2 cursor-pointer"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as RecurrenceType | '')}
          >
            <option value="">Nunca</option>
            {Object.entries(RECURRENCE_OPTIONS).map(([type, { label }]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
