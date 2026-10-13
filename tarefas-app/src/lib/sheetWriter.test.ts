import { describe, it, expect, vi, afterEach } from 'vitest';
import { postSheetAction, WEB_APP_URL_RE } from './sheetWriter';

const ENDPOINT = 'https://script.google.com/macros/s/abc_123/exec';

function mockFetch(response: Partial<Response>) {
  const fn = vi.fn().mockResolvedValue({ ok: true, status: 200, ...response });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('postSheetAction', () => {
  it('posts the action as text/plain JSON', async () => {
    const fetchMock = mockFetch({ json: () => Promise.resolve({ ok: true }) });
    await postSheetAction(ENDPOINT, { action: 'delete', sheet: 'Done', match: { title: 'T', date: '01/01/2026' } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toContain('text/plain');
    expect(JSON.parse(init.body)).toEqual({ action: 'delete', sheet: 'Done', match: { title: 'T', date: '01/01/2026' } });
  });

  it('throws the script error message when ok is false', async () => {
    mockFetch({ json: () => Promise.resolve({ ok: false, error: 'Tarefa não encontrada' }) });
    await expect(postSheetAction(ENDPOINT, { action: 'create', sheet: 'To Do', row: [] })).rejects.toThrow('Tarefa não encontrada');
  });

  it('throws when the response is not JSON (e.g. Google login page)', async () => {
    mockFetch({ json: () => Promise.reject(new SyntaxError('bad')) });
    await expect(postSheetAction(ENDPOINT, { action: 'create', sheet: 'To Do', row: [] })).rejects.toThrow('não retornou JSON');
  });

  it('throws on HTTP errors', async () => {
    mockFetch({ ok: false, status: 500 });
    await expect(postSheetAction(ENDPOINT, { action: 'create', sheet: 'To Do', row: [] })).rejects.toThrow('HTTP 500');
  });
});

describe('WEB_APP_URL_RE', () => {
  it('accepts a deployed web app URL and rejects others', () => {
    expect(WEB_APP_URL_RE.test(ENDPOINT)).toBe(true);
    expect(WEB_APP_URL_RE.test('https://script.google.com/macros/s/abc/dev')).toBe(false);
    expect(WEB_APP_URL_RE.test('https://docs.google.com/spreadsheets/d/x/edit')).toBe(false);
  });
});

describe('postSheetAction (listas)', () => {
  it('sends kind=list for extra list items', async () => {
    const fetchMock = mockFetch({ json: () => Promise.resolve({ ok: true }) });
    await postSheetAction(ENDPOINT, { action: 'delete', kind: 'list', sheet: 'Livros', match: { title: 'Livro X' } });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ kind: 'list', sheet: 'Livros', match: { title: 'Livro X' } });
  });
});

describe('postSheetAction (lote)', () => {
  it('sends all operations in a single request', async () => {
    const fetchMock = mockFetch({ json: () => Promise.resolve({ ok: true }) });
    await postSheetAction(ENDPOINT, {
      action: 'batch',
      ops: [
        { action: 'move', from: 'To Do', to: 'Done', match: { title: 'A', date: '01/01/2026' } },
        { action: 'move', from: 'In Progress', to: 'Done', match: { title: 'B', date: '' } },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).ops).toHaveLength(2);
  });
});
