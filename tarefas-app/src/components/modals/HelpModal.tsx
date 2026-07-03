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
        <button type="button" className="btn-outline" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <table className="w-full text-[0.875rem] mb-4 border-collapse">
        <tbody>
          {SHORTCUTS.map(([key, desc]) => (
            <tr key={key}>
              <td className="py-1.5 pr-3 font-semibold text-text w-16">{key}</td>
              <td className="py-1.5 text-text-muted">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center gap-2.5 mb-3">
        <select
          className="field-input px-2.5 py-1.5 text-[0.85rem] cursor-pointer"
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
        >
          {Object.entries(TEMPLATE_CONFIG).map(([type, { label }]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" className="link-btn" onClick={() => onDownloadTemplate(templateType)}>
          Baixar modelo .csv
        </button>
      </div>
      <div className="text-center mb-1">
        <button type="button" className="text-[0.8rem] text-text-muted bg-transparent border-0 cursor-pointer hover:text-error-color" onClick={onResetSettings}>
          Limpar configurações
        </button>
      </div>
      <p className="text-[0.8rem] text-text-muted text-center mt-2">Sprint Board v{APP_VERSION}</p>
    </Modal>
  );
}
