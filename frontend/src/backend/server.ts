import 'server-only';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getBackendServerBaseUrl } from '@/backend/shared';
import type { Document, DocumentListResponse } from '@/backend/types';

export async function listDocumentsServer(): Promise<Document[]> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    return [];
  }

  try {
    const response = await fetch(`${getBackendServerBaseUrl()}/api/documents`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as DocumentListResponse;
    return payload.documents;
  } catch {
    return [];
  }
}
