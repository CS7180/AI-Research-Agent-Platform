import FolderSection from '@/components/documents/FolderSection';
import UploadDropzone from '@/components/documents/UploadDropzone';

const FOLDERS = [
  {
    name: 'Distributed Systems',
    fileCount: 4,
    files: [
      { name: 'CS6650_Lecture11_2PC.pdf', type: 'pdf' as const, size: '2.4 MB', detail: '42 chunks', status: 'ready' as const },
      { name: 'CS6650_Lecture12_3PC.pdf', type: 'pdf' as const, size: '2.1 MB', detail: '38 chunks', status: 'ready' as const },
      { name: 'Raft_Consensus.pdf', type: 'pdf' as const, size: '1.2 MB', detail: '51 chunks', status: 'ready' as const },
      { name: 'distributed_systems_note...', type: 'md' as const, size: '89 KB', detail: '24 chunks', status: 'ready' as const },
    ],
  },
  {
    name: 'AI / Machine Learning',
    fileCount: 3,
    files: [
      { name: 'CS7180_RAG_Survey.pdf', type: 'pdf' as const, size: '3.1 MB', detail: '65 chunks', status: 'ready' as const },
      { name: 'Attention_Is_All_You_Nee...', type: 'pdf' as const, size: '4.5 MB', detail: '84 chunks', status: 'ready' as const },
      { name: 'ml_study_notes.txt', type: 'txt' as const, size: '34 KB', detail: '12 chunks', status: 'processing' as const },
    ],
  },
  {
    name: 'Project Docs',
    fileCount: 1,
    files: [],
  },
];

export default function KnowledgeSidebar() {
  return (
    <aside
      className="flex h-full w-full flex-col rounded-xl border border-border bg-surface"
      aria-label="Knowledge base"
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <h2 className="text-base font-semibold text-foreground">Knowledge Base</h2>
        <p className="text-xs text-muted-light">8 files in 3 folders</p>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <input
          type="search"
          placeholder="Search files and folders"
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-light outline-none focus:border-primary"
          aria-label="Search knowledge base"
          readOnly
        />
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2">
        {FOLDERS.map((folder) => (
          <FolderSection key={folder.name} {...folder} />
        ))}
      </div>

      {/* Upload */}
      <UploadDropzone />
    </aside>
  );
}
