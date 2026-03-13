import {
  clearKnowledgeBaseClient,
  deleteDocumentClient,
  downloadDocumentClient,
  listDocumentsClient,
  renameDocumentClient,
  streamChatClient,
  uploadDocumentClient,
} from '@/backend/client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: jest.fn(),
}));

const mockedGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.Mock;

function mockSession(token: string | null) {
  mockedGetSupabaseBrowserClient.mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: token ? { access_token: token } : null },
      }),
    },
  });
}

describe('backend/client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('throws when no active session exists', async () => {
    mockSession(null);

    await expect(listDocumentsClient()).rejects.toThrow('No active session.');
  });

  it('lists documents on success', async () => {
    mockSession('token-123');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ documents: [{ id: 'doc-1' }] }),
    });

    const docs = await listDocumentsClient();

    expect(docs).toEqual([{ id: 'doc-1' }]);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/documents', {
      method: 'GET',
      headers: { Authorization: 'Bearer token-123' },
    });
  });

  it('throws when list documents request fails', async () => {
    mockSession('token-123');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    await expect(listDocumentsClient()).rejects.toThrow('Fetch documents failed: 500');
  });

  it('renames document with expected payload', async () => {
    mockSession('token-abc');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await renameDocumentClient('doc-1', 'renamed.pdf');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/documents/doc-1', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer token-abc',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename: 'renamed.pdf' }),
    });
  });

  it('throws on rename failure', async () => {
    mockSession('token-abc');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 409 });

    await expect(renameDocumentClient('doc-1', 'renamed.pdf')).rejects.toThrow(
      'Rename failed: 409',
    );
  });

  it('deletes document successfully', async () => {
    mockSession('token-del');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await deleteDocumentClient('doc-9');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/documents/doc-9', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token-del' },
    });
  });

  it('throws on delete failure', async () => {
    mockSession('token-del');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    await expect(deleteDocumentClient('missing')).rejects.toThrow('Delete failed: 404');
  });

  it('clears knowledge base successfully', async () => {
    mockSession('token-clear');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await clearKnowledgeBaseClient();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/documents/clear', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token-clear' },
    });
  });

  it('throws on clear knowledge base failure', async () => {
    mockSession('token-clear');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });

    await expect(clearKnowledgeBaseClient()).rejects.toThrow('Clear knowledge base failed: 503');
  });

  it('uploads document with form data', async () => {
    mockSession('token-up');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    await uploadDocumentClient(file, '/lectures');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'http://localhost:8000/api/documents/upload',
    );
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ Authorization: 'Bearer token-up' });
    expect(options.body).toBeInstanceOf(FormData);
  });

  it('throws on upload failure', async () => {
    mockSession('token-up');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400 });

    const file = new File(['hello'], 'bad.exe', { type: 'application/octet-stream' });
    await expect(uploadDocumentClient(file)).rejects.toThrow('Upload failed: 400');
  });

  it('downloads document and triggers browser download', async () => {
    mockSession('token-dl');
    const blob = new Blob(['test'], { type: 'text/plain' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    });

    const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(window, 'URL', {
      value: { createObjectURL, revokeObjectURL },
      configurable: true,
    });

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await downloadDocumentClient('doc-5', 'report.txt');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
  });

  it('throws on download failure', async () => {
    mockSession('token-dl');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401 });

    await expect(downloadDocumentClient('doc-5', 'report.txt')).rejects.toThrow(
      'Download failed: 401',
    );
  });

  it('streams chat tokens and sources', async () => {
    mockSession('token-chat');
    const onToken = jest.fn();
    const onSources = jest.fn();
    const encoder = new TextEncoder();
    const reader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: encoder.encode(
            'data: {"type":"token","content":"Hello"}\n\n' +
              'data: {"type":"sources","sources":[{"name":"notes.pdf"}]}\n\n',
          ),
        })
        .mockResolvedValueOnce({
          done: false,
          value: encoder.encode('data: [DONE]\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });

    await streamChatClient('hello', { onToken, onSources });

    expect(onToken).toHaveBeenCalledWith('Hello');
    expect(onSources).toHaveBeenCalledWith([{ name: 'notes.pdf' }]);
  });

  it('throws when chat response has no body', async () => {
    mockSession('token-chat');
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, body: null });

    await expect(
      streamChatClient('hello', {
        onToken: jest.fn(),
      }),
    ).rejects.toThrow('Chat stream body is empty.');
  });

  it('throws when chat response contains error event', async () => {
    mockSession('token-chat');
    const encoder = new TextEncoder();
    const reader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: encoder.encode('data: {"type":"error","content":"upstream failed"}\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });

    await expect(
      streamChatClient('hello', {
        onToken: jest.fn(),
      }),
    ).rejects.toThrow('upstream failed');
  });
});
