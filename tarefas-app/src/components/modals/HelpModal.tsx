import { useState } from 'react';
import { Modal } from '../Modal';
import { TEMPLATE_CONFIG } from '../../lib/config';
import { APP_VERSION } from '../../lib/config';

const SHORTCUTS: [string, string][] = [
  ['R', 'Atualizar board'],
  ['F', 'Focar no filtro'],
  ['N', 'Nova tarefa'],
  ['?', 'Mostrar/ocultar atalhos'],
  ['Esc', 'Fechar modal ou atalhos'],
  ['Ctrl+Enter', 'Submeter nova tarefa (no modal)'],
  ['D', 'Alternar modo compacto'],
  ['T', 'Alternar tema claro/escuro'],
  ['S', 'Ciclar ordenação (original → prioridade → data → A-Z)'],
  ['V', 'Alternar modo de seleção'],
];

interface HelpModalProps {
  onClose(): void;
  onDownloadTemplate(type: string): void;
  onResetSettings(): void;
}

export function HelpModal({ onClose, onDownloadTemplate, onResetSettings }: HelpModalProps) {
  const [templateType, setTemplateType] = useState('tarefas');

  return (
    <Modal
      onClose={onClose}
      title="Atalhos de teclado"
      footer={
        <button type="button" className="rounded px-3 py-1.5 border border-border-input" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <table className="w-full text-sm mb-4">
        <tbody>
          {SHORTCUTS.map(([key, desc]) => (
            <tr key={key} className="border-b border-border">
              <td className="py-1 pr-3 font-mono">{key}</td>
              <td className="py-1 text-text-muted">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mb-3">
        <select
          className="text-xs rounded px-2 py-1 border border-border-input bg-surface text-text"
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
        >
          {Object.entries(TEMPLATE_CONFIG).map(([type, { label }]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" className="text-xs rounded px-2 py-1 border border-border-input" onClick={() => onDownloadTemplate(templateType)}>
          Baixar modelo .csv
        </button>
      </div>
      <button type="button" className="text-xs text-error-color underline" onClick={onResetSettings}>
        Limpar configurações
      </button>
      <p className="text-xs text-text-muted mt-3">Sprint Board v{APP_VERSION}</p>
    </Modal>
  );
}
