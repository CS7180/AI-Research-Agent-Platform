import type { FileItem, Folder } from '@/types/document';

const FOLDERS: Folder[] = [
    {
        name: 'Distributed Systems',
        icon: '📂',
        count: 4,
        expanded: true,
        files: [
            { name: 'CS6650_Lecture11_2PC.pdf', size: '2.4 MB', chunks: '42 chunks', type: 'PDF', status: 'READY' },
            { name: 'CS6650_Lecture12_3PC.pdf', size: '2.1 MB', chunks: '38 chunks', type: 'PDF', status: 'READY' },
            { name: 'Raft_Consensus.pdf', size: '1.2 MB', chunks: '51 chunks', type: 'PDF', status: 'READY' },
            { name: 'distributed_systems_note...', size: '89 KB', chunks: '24 chunks', type: 'MD', status: 'READY' },
        ],
    },
    {
        name: 'AI / Machine Learning',
        icon: '📂',
        count: 3,
        expanded: true,
        files: [
            { name: 'CS7180_RAG_Survey.pdf', size: '3.1 MB', chunks: '93 chunks', type: 'PDF', status: 'READY' },
            { name: 'Attention_Is_All_You_Nee...', size: '1.8 MB', chunks: '67 chunks', type: 'PDF', status: 'READY' },
            { name: 'ml_study_notes.txt', size: '34 KB', chunks: '12 chunks', type: 'TXT', status: 'PROCESSING' },
        ],
    },
    {
        name: 'Project Docs',
        icon: '📁',
        count: 1,
        expanded: false,
        files: [],
    },
];

/** Returns Tailwind classes for a file type badge. */
function fileTypeBadgeClasses(type: FileItem['type']): { bg: string; text: string } {
    switch (type) {
        case 'PDF':
            return { bg: 'bg-status-red/[0.08]', text: 'text-status-red' };
        case 'MD':
            return { bg: 'bg-primary/[0.07]', text: 'text-primary' };
        case 'TXT':
            return { bg: 'bg-status-orange/10', text: 'text-status-orange' };
    }
}

/** Renders a status badge for a file item. */
function StatusBadge({ status }: { status: FileItem['status'] }) {
    if (status === 'READY') {
        return (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-status-green/10 text-status-green">
                READY
            </span>
        );
    }
    return (
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-status-orange/10 text-status-orange">
            PROCESSING
        </span>
    );
}

/** Right sidebar — knowledge base file explorer with folder tree and upload zone. */
export default function KnowledgeBase() {
    return (
        <aside
            className="w-[340px] min-w-[340px] h-full rounded-[18px] bg-card-bg card-shadow flex flex-col overflow-hidden"
            aria-label="Knowledge base"
        >
            {/* ── Header ── */}
            <header className="pt-6 pb-2 px-5">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                    Knowledge Base
                </h2>
                <p className="text-[12.5px] mt-0.5 text-text-tertiary">8 files in 3 folders</p>
            </header>

            {/* ── Search ── */}
            <div className="px-3 pt-1 pb-3">
                <label htmlFor="kb-search" className="sr-only">
                    Search files and folders
                </label>
                <input
                    id="kb-search"
                    type="search"
                    placeholder="Search files and folders..."
                    className="w-full h-[34px] rounded-[10px] px-4 text-[12.5px] bg-input-bg border-none outline-none text-text-primary placeholder:text-text-placeholder"
                />
            </div>

            {/* ── File tree ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-3" role="tree">
                {FOLDERS.map((folder, fi) => (
                    <div key={folder.name} role="treeitem" aria-expanded={folder.expanded}>
                        {/* Folder row */}
                        <button
                            type="button"
                            className="w-full flex items-center gap-2 py-2 cursor-pointer bg-transparent border-none text-left"
                            aria-label={`${folder.name} folder, ${folder.count} files`}
                        >
                            <span className="text-[17px]" aria-hidden="true">{folder.icon}</span>
                            <span className="text-[13px] font-medium flex-1 text-text-primary">
                                {folder.name}
                            </span>
                            <span className="text-[11px] min-w-[22px] h-[18px] rounded-full flex items-center justify-center bg-input-bg text-text-muted">
                                {folder.count}
                            </span>
                            <span className="text-[11px] text-text-placeholder" aria-hidden="true">
                                {folder.expanded ? '▾' : '▸'}
                            </span>
                        </button>

                        {/* Files */}
                        {folder.expanded && (
                            <ul className="list-none m-0 p-0" role="group">
                                {folder.files.map((file) => {
                                    const badge = fileTypeBadgeClasses(file.type);
                                    return (
                                        <li
                                            key={file.name}
                                            className="flex items-center gap-2.5 pl-6 py-1.5 cursor-pointer"
                                            role="treeitem"
                                        >
                                            {/* Type badge */}
                                            <span
                                                className={`w-6 h-6 min-w-6 rounded-[5px] flex items-center justify-center ${badge.bg}`}
                                            >
                                                <span className={`text-[8.5px] font-bold ${badge.text}`}>
                                                    {file.type}
                                                </span>
                                            </span>

                                            {/* Name + meta */}
                                            <span className="flex flex-col min-w-0 flex-1">
                                                <span className="text-xs truncate font-[450] text-text-primary">
                                                    {file.name}
                                                </span>
                                                <span className="text-[10.5px] text-text-muted">
                                                    {file.size} · {file.chunks}
                                                </span>
                                            </span>

                                            {/* Status */}
                                            <StatusBadge status={file.status} />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* Separator between folders */}
                        {fi < FOLDERS.length - 1 && (
                            <hr className="my-2 border-t border-border-light" />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Upload zone ── */}
            <div className="px-3 pb-5 pt-2">
                <button
                    type="button"
                    className="w-full h-10 rounded-xl flex items-center justify-center cursor-pointer bg-transparent border-[1.5px] border-dashed border-border-dashed"
                    aria-label="Upload documents"
                >
                    <span className="text-xs text-text-muted">
                        <span className="font-medium text-primary">Drop files</span> or click to
                        upload
                    </span>
                </button>
            </div>
        </aside>
    );
}
