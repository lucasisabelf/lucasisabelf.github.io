import { FETCH_TIMEOUT_MS } from './sheetUrl';

export interface RowMatch {
  title: string;
  date?: string;
}

/** `list` = aba de lista extra (cabeçalho na linha 1, A:E, localizada só pelo nome); ausente = aba do board. */
type SheetKind = { kind?: 'list' };

export type SheetWriteAction =
  | ({ action: 'create'; sheet: string; row: string[] } & SheetKind)
  | ({ action: 'update'; sheet: string; match: RowMatch; row: string[] } & SheetKind)
  | { action: 'move'; from: string; to: string; match: RowMatch }
  | ({ action: 'delete'; sheet: string; match: RowMatch } & SheetKind);

/**
 * Lote feito no cliente — uma requisição por operação, em sequência (o script serializa via lock,
 * então paralelizar não ganha nada). Mantém o Apps Script inalterado.
 */
export async function postSheetActions(endpoint: string, payloads: SheetWriteAction[]): Promise<void> {
  for (let i = 0; i < payloads.length; i++) {
    try {
      await postSheetAction(endpoint, payloads[i]);
    } catch (err) {
      const done = i === 0 ? 'nenhum item foi alterado' : `${i} item(ns) anterior(es) já foram aplicados`;
      throw new Error(`Falha no item ${i + 1} de ${payloads.length}: ${err instanceof Error ? err.message : String(err)} (${done}).`);
    }
  }
}

export const WEB_APP_URL_RE = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;

function readError(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('ok' in body)) return 'Resposta inesperada do Apps Script.';
  if (body.ok === true) return null;
  return 'error' in body && typeof body.error === 'string' ? body.error : 'Erro desconhecido no Apps Script.';
}

/**
 * Content-Type text/plain evita o preflight CORS — o Web App do Apps Script não responde OPTIONS.
 * O fetch segue o redirect pra script.googleusercontent.com, que devolve o JSON com CORS liberado.
 */
export async function postSheetAction(endpoint: string, payload: SheetWriteAction): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS * 2);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Apps Script respondeu HTTP ${res.status}.`);
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      throw new Error('O Apps Script não retornou JSON. Confira se a implantação está como "Qualquer pessoa".');
    }
    const error = readError(body);
    if (error) throw new Error(error);
  } finally {
    clearTimeout(timer);
  }
}
