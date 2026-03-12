export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_size_bytes: number;
  mime_type: string;
  folder_path: string;
  file_hash: string | null;
  is_starred: boolean;
  summary: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}
