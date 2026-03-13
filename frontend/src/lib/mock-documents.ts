/**
 * Mock document data for UI development.
 *
 * This module provides placeholder documents while the backend API integration
 * is not yet wired up. Components import `MOCK_DOCUMENTS` and the `Document`
 * type from here.
 *
 * TODO(#6): Replace with real API calls once document endpoints are connected.
 */

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  folder_path: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  summary: string;
  file_hash: string;
  is_starred: boolean;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

interface MockData {
  documents: Document[];
  total: number;
}

const documents: Document[] = [
  {
    id: 'doc-001',
    user_id: 'user-001',
    filename: 'CS6650_Lecture11_2PC.pdf',
    original_filename: 'CS6650_Lecture11_2PC.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 2_516_582,
    storage_path: '/docs/distributed-systems/CS6650_Lecture11_2PC.pdf',
    folder_path: '/Distributed Systems',
    status: 'READY',
    summary: 'Two-Phase Commit protocol lecture slides',
    file_hash: 'a1b2c3d4',
    is_starred: false,
    chunk_count: 42,
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:05:00Z',
  },
  {
    id: 'doc-002',
    user_id: 'user-001',
    filename: 'CS6650_Lecture12_3PC.pdf',
    original_filename: 'CS6650_Lecture12_3PC.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 2_202_009,
    storage_path: '/docs/distributed-systems/CS6650_Lecture12_3PC.pdf',
    folder_path: '/Distributed Systems',
    status: 'READY',
    summary: 'Three-Phase Commit and Paxos overview',
    file_hash: 'e5f6g7h8',
    is_starred: false,
    chunk_count: 38,
    created_at: '2026-02-21T09:00:00Z',
    updated_at: '2026-02-21T09:04:00Z',
  },
  {
    id: 'doc-003',
    user_id: 'user-001',
    filename: 'Raft_Consensus.pdf',
    original_filename: 'Raft_Consensus.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 1_258_291,
    storage_path: '/docs/distributed-systems/Raft_Consensus.pdf',
    folder_path: '/Distributed Systems',
    status: 'READY',
    summary: 'Raft consensus algorithm paper',
    file_hash: 'i9j0k1l2',
    is_starred: true,
    chunk_count: 51,
    created_at: '2026-02-19T14:30:00Z',
    updated_at: '2026-02-19T14:35:00Z',
  },
  {
    id: 'doc-004',
    user_id: 'user-001',
    filename: 'distributed_systems_notes.md',
    original_filename: 'distributed_systems_notes.md',
    mime_type: 'text/markdown',
    file_size_bytes: 91_136,
    storage_path: '/docs/distributed-systems/distributed_systems_notes.md',
    folder_path: '/Distributed Systems',
    status: 'READY',
    summary: 'Personal notes on distributed systems concepts',
    file_hash: 'm3n4o5p6',
    is_starred: false,
    chunk_count: 24,
    created_at: '2026-02-22T16:00:00Z',
    updated_at: '2026-02-22T16:02:00Z',
  },
  {
    id: 'doc-005',
    user_id: 'user-001',
    filename: 'CS7180_RAG_Survey.pdf',
    original_filename: 'CS7180_RAG_Survey.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 3_250_585,
    storage_path: '/docs/ai-ml/CS7180_RAG_Survey.pdf',
    folder_path: '/AI / Machine Learning',
    status: 'READY',
    summary: 'Survey on Retrieval-Augmented Generation techniques',
    file_hash: 'q7r8s9t0',
    is_starred: false,
    chunk_count: 93,
    created_at: '2026-02-18T11:00:00Z',
    updated_at: '2026-02-18T11:08:00Z',
  },
  {
    id: 'doc-006',
    user_id: 'user-001',
    filename: 'Attention_Is_All_You_Need.pdf',
    original_filename: 'Attention_Is_All_You_Need.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 1_887_436,
    storage_path: '/docs/ai-ml/Attention_Is_All_You_Need.pdf',
    folder_path: '/AI / Machine Learning',
    status: 'READY',
    summary: 'Original Transformer architecture paper',
    file_hash: 'u1v2w3x4',
    is_starred: true,
    chunk_count: 67,
    created_at: '2026-02-17T20:00:00Z',
    updated_at: '2026-02-17T20:06:00Z',
  },
  {
    id: 'doc-007',
    user_id: 'user-001',
    filename: 'ml_study_notes.txt',
    original_filename: 'ml_study_notes.txt',
    mime_type: 'text/plain',
    file_size_bytes: 34_816,
    storage_path: '/docs/ai-ml/ml_study_notes.txt',
    folder_path: '/AI / Machine Learning',
    status: 'PROCESSING',
    summary: '',
    file_hash: 'y5z6a7b8',
    is_starred: false,
    chunk_count: 12,
    created_at: '2026-02-23T08:00:00Z',
    updated_at: '2026-02-23T08:01:00Z',
  },
  {
    id: 'doc-008',
    user_id: 'user-001',
    filename: 'project_proposal.pdf',
    original_filename: 'project_proposal.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 524_288,
    storage_path: '/docs/project/project_proposal.pdf',
    folder_path: '/Project Docs',
    status: 'READY',
    summary: 'CS7180 final project proposal',
    file_hash: 'c9d0e1f2',
    is_starred: false,
    chunk_count: 15,
    created_at: '2026-02-15T12:00:00Z',
    updated_at: '2026-02-15T12:03:00Z',
  },
];

export const MOCK_DOCUMENTS: MockData = {
  documents,
  total: documents.length,
};
