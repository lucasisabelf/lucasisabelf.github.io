import { DropdownMenu } from '../DropdownMenu';

const ITEM_CLASS = 'text-left text-xs text-text-muted bg-transparent border-0 cursor-pointer p-1.5 hover:text-blue';

interface HeaderMenusProps {
  onCopyBoardLink(): void;
  onCopySheetUrl(): void;
  onShareWhatsApp(): void;
  onExportText(): void;
  onDownloadMd(): void;
  onDownloadJson(): void;
  onDownloadCsv(): void;
  onDownloadIcs(): void;
}

export function HeaderMenus({
  onCopyBoardLink,
  onCopySheetUrl,
  onShareWhatsApp,
  onExportText,
  onDownloadMd,
  onDownloadJson,
  onDownloadCsv,
  onDownloadIcs,
}: HeaderMenusProps) {
  return (
    <div className="flex gap-1.5 mt-2">
      <DropdownMenu label="Compartilhar ▾" buttonClassName="text-xs rounded px-2 py-1 border border-border-input">
        <button type="button" className={ITEM_CLASS} onClick={onCopyBoardLink}>
          Copiar link do board
        </button>
        <button type="button" className={ITEM_CLASS} onClick={onCopySheetUrl}>
          Copiar URL
        </button>
        <button type="button" className={ITEM_CLASS} onClick={onShareWhatsApp}>
          WhatsApp
        </button>
        <button type="button" className={ITEM_CLASS} onClick={onExportText}>
          Exportar (E)
        </button>
      </DropdownMenu>
      <DropdownMenu label="Baixar ▾" buttonClassName="text-xs rounded px-2 py-1 border border-border-input">
        <button type="button" className={ITEM_CLASS} onClick={onDownloadMd}>
          Baixar .md
        </button>
        <button type="button" className={ITEM_CLASS} onClick={onDownloadJson}>
          JSON
        </button>
        <button type="button" className={ITEM_CLASS} onClick={onDownloadCsv}>
          CSV
        </button>
        <button type="button" className={ITEM_CLASS} onClick={onDownloadIcs}>
          Agenda (.ics)
        </button>
      </DropdownMenu>
    </div>
  );
}
