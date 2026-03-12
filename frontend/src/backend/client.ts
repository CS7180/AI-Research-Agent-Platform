import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBackendApiBaseUrl } from '@/backend/shared';
import type { Document } from '@/backend/types';

interface StreamHandlers {
  onToken: (token: string) => void;
  onSources?: (sources: unknown[]) => void;
}

async function getAccessTokenOrThrow(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session.');
  }

  return session.access_token;
}

export async function downloadDocumentClient(documentId: string, filename: string): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/documents/${documentId}/download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function renameDocumentClient(documentId: string, newFilename: string): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/documents/${documentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename: newFilename }),
  });

  if (!response.ok) {
    throw new Error(`Rename failed: ${response.status}`);
  }
}

export async function deleteDocumentClient(documentId: string): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

export async function clearKnowledgeBaseClient(): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/documents/clear`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Clear knowledge base failed: ${response.status}`);
  }
}

export async function uploadDocumentClient(file: File, folderPath = '/'): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();
  const form = new FormData();
  form.append('file', file);
  form.append('folder_path', folderPath);

  const response = await fetch(`${getBackendApiBaseUrl()}/api/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
}

export async function listDocumentsClient(): Promise<Document[]> {
  const accessToken = await getAccessTokenOrThrow();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/documents`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch documents failed: ${response.status}`);
  }

  const data = await response.json();
  return data.documents || [];
}

export async function streamChatClient(
  message: string,
  handlers: StreamHandlers,
): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();
  const response = await fetch(`${getBackendApiBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Chat stream body is empty.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const payload = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.replace(/^data:\s?/, ''))
        .join('\n')
        .trim();

      if (!payload) continue;
      if (payload === '[DONE]') return;

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(payload) as Record<string, unknown>;
      } catch {
        continue;
      }

      if (parsed.type === 'token') {
        handlers.onToken(String(parsed.content ?? ''));
      } else if (parsed.type === 'sources' && Array.isArray(parsed.sources)) {
        handlers.onSources?.(parsed.sources);
      } else if (parsed.type === 'error') {
        throw new Error(String(parsed.content ?? 'Unknown chat error'));
      }
    }
  }
}
