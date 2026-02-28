import type { Folder } from '@/types/document';

const FOLDERS: Folder[] = [
    {
        id: 'f1',
        name: 'Distributed Systems',
        fileCount: 4,
        isExpanded: true,
        files: [
            { id: 'd1', filename: 'CS6650_Lecture11_2PC.pdf', fileType: 'PDF', size: '2.4 MB', chunks: 42, status: 'READY' },
            { id: 'd2', filename: 'CS6650_Lecture12_3PC.pdf', fileType: 'PDF', size: '2.1 MB', chunks: 38, status: 'READY' },
            { id: 'd3', filename: 'Raft_Consensus.pdf', fileType: 'PDF', size: '1.2 MB', chunks: 51, status: 'READY' },
            { id: 'd4', filename: 'distributed_systems_note...', fileType: 'MD', size: '89 KB', chunks: 24, status: 'READY' },
        ],
    },
    {
        id: 'f2',
        name: 'AI / Machine Learning',
        fileCount: 3,
        isExpanded: true,
        files: [
            { id: 'd5', filename: 'CS7180_RAG_Survey.pdf', fileType: 'PDF', size: '3.1 MB', chunks: 93, status: 'READY' },
            { id: 'd6', filename: 'Attention_Is_All_You_Nee...', fileType: 'PDF', size: '1.8 MB', chunks: 67, status: 'READY' },
            { id: 'd7', filename: 'ml_study_notes.txt', fileType: 'TXT', size: '34 KB', chunks: 12, status: 'PROCESSING' },
        ],
    },
    {
        id: 'f3',
        name: 'Project Docs',
        fileCount: 1,
        isExpanded: false,
        files: [],
    },
];

/** Returns the Tailwind classes for a file-type badge. */
function badgeClasses(fileType: 'PDF' | 'MD' | 'TXT'): { bg: string; text: string; label: string } {
    switch (fileType) {
        case 'PDF':
            return { bg: 'bg-badge-pdf-bg', text: 'text-badge-pdf', label: 'PDF' };
        case 'MD':
            return { bg: 'bg-badge-md-bg', text: 'text-badge-md', label: 'MD' };
        case 'TXT':
            return { bg: 'bg-badge-txt-bg', text: 'text-badge-txt', label: 'TXT' };
    }
}

export default function KnowledgeBaseSidebar() {
    return (
        <aside className="flex w-[340px] shrink-0 flex-col rounded-[18px] bg-surface-card shadow-[0_2px_12px_rgba(0,0,0,0.06),0_0.5px_2px_rgba(0,0,0,0.04)]">
            {/* ── Header ── */}
            <header className="px-5 pt-8 pb-2">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                    Knowledge Base
                </h2>
                <p className="mt-1 text-[12.5px] text-text-tertiary">8 files in 3 folders</p>
            </header>

            {/* ── Search ── */}
            <div className="px-3">
                <label htmlFor="kb-search" className="sr-only">
                    Search files and folders
                </label>
                <input
                    id="kb-search"
                    type="search"
                    placeholder="Search files and folders..."
                    className="w-full rounded-[10px] bg-surface px-4 py-2 text-[12.5px] text-text-primary placeholder:text-text-placeholder focus:outline-none"
                />
            </div>

            {/* ── Folder Tree ── */}
            <div
                className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-5 pb-4"
                role="tree"
                aria-label="Knowledge base files"
            >
                {FOLDERS.map((folder, folderIdx) => (
                    <div key={folder.id} role="treeitem" aria-expanded={folder.isExpanded}>
                        {/* Folder row */}
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 py-2 text-left"
                            aria-label={`${folder.name}, ${folder.fileCount} files`}
                        >
                            <span className="text-[17px] text-text-tertiary" aria-hidden="true">
                                {folder.isExpanded ? '📂' : '📁'}
                            </span>
                            <span className="flex-1 text-[13px] font-medium text-text-primary">
                                {folder.name}
                            </span>
                            <span className="flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-surface px-1 text-[11px] text-text-quaternary">
                                {folder.fileCount}
                            </span>
                            <span className="text-[11px] text-text-placeholder" aria-hidden="true">
                                {folder.isExpanded ? '▾' : '▸'}
                            </span>
                        </button>

                        {/* Files */}
                        {folder.isExpanded && (
                            <ul className="ml-1 flex flex-col gap-0.5" role="group">
                                {folder.files.map((file) => {
                                    const badge = badgeClasses(file.fileType);
                                    const isProcessing = file.status === 'PROCESSING';
                                    return (
                                        <li key={file.id} role="treeitem" className="flex items-center gap-2.5 py-1.5 pl-5">
                                            {/* File type badge */}
                                            <span
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] ${badge.bg}`}
                                            >
                                                <span className={`text-[8.5px] font-bold ${badge.text}`}>{badge.label}</span>
                                            </span>

                                            {/* Name & meta */}
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span className="truncate text-xs font-[450] text-text-primary">
                                                    {file.filename}
                                                </span>
                                                <span className="text-[10.5px] text-text-quaternary">
                                                    {file.size} · {file.chunks} chunks
                                                </span>
                                            </span>

                                            {/* Status */}
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${isProcessing
                                                        ? 'bg-status-processing-bg text-status-processing'
                                                        : 'bg-status-ready-bg text-status-ready'
                                                    }`}
                                            >
                                                {file.status}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* Separator between folders */}
                        {folderIdx < FOLDERS.length - 1 && folder.isExpanded && (
                            <hr className="my-2 border-border-light" />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Upload Zone ── */}
            <div className="px-3 pb-4">
                <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-xl border-[1.5px] border-dashed border-border-dashed py-2.5 text-xs text-text-quaternary"
                    aria-label="Upload documents"
                >
                    <span className="font-medium text-primary">Drop files</span>
                    <span className="ml-1">or click to upload</span>
                </button>
            </div>
        </aside>
    );
}
