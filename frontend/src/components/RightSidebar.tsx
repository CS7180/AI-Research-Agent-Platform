type FileItem = {
    name: string;
    size: string;
    chunks: string;
    type: "PDF" | "MD" | "TXT";
    status: "READY" | "PROCESSING";
};

type Folder = {
    name: string;
    icon: string;
    count: number;
    expanded: boolean;
    files: FileItem[];
};

const folders: Folder[] = [
    {
        name: "Distributed Systems",
        icon: "📂",
        count: 4,
        expanded: true,
        files: [
            { name: "CS6650_Lecture11_2PC.pdf", size: "2.4 MB", chunks: "42 chunks", type: "PDF", status: "READY" },
            { name: "CS6650_Lecture12_3PC.pdf", size: "2.1 MB", chunks: "38 chunks", type: "PDF", status: "READY" },
            { name: "Raft_Consensus.pdf", size: "1.2 MB", chunks: "51 chunks", type: "PDF", status: "READY" },
            { name: "distributed_systems_note...", size: "89 KB", chunks: "24 chunks", type: "MD", status: "READY" },
        ],
    },
    {
        name: "AI / Machine Learning",
        icon: "📂",
        count: 3,
        expanded: true,
        files: [
            { name: "CS7180_RAG_Survey.pdf", size: "3.1 MB", chunks: "93 chunks", type: "PDF", status: "READY" },
            { name: "Attention_Is_All_You_Nee...", size: "1.8 MB", chunks: "67 chunks", type: "PDF", status: "READY" },
            { name: "ml_study_notes.txt", size: "34 KB", chunks: "12 chunks", type: "TXT", status: "PROCESSING" },
        ],
    },
    {
        name: "Project Docs",
        icon: "📁",
        count: 1,
        expanded: false,
        files: [],
    },
];

function fileTypeColor(type: FileItem["type"]) {
    switch (type) {
        case "PDF":
            return { bg: "rgba(255,59,48,0.08)", text: "var(--color-red)" };
        case "MD":
            return { bg: "rgba(0,113,227,0.07)", text: "var(--color-primary)" };
        case "TXT":
            return { bg: "rgba(245,166,35,0.10)", text: "var(--color-orange)" };
    }
}

function statusBadge(status: FileItem["status"]) {
    if (status === "READY") {
        return (
            <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                    background: "rgba(45,198,83,0.10)",
                    color: "var(--color-green)",
                }}
            >
                READY
            </span>
        );
    }
    return (
        <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{
                background: "rgba(245,166,35,0.10)",
                color: "var(--color-orange)",
            }}
        >
            PROCESSING
        </span>
    );
}

export default function RightSidebar() {
    return (
        <aside className="w-[340px] min-w-[340px] h-full rounded-[18px] bg-white card-shadow flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <div className="pt-6 pb-2 px-5">
                <h2
                    className="text-[20px] font-semibold tracking-[-0.4px]"
                    style={{ color: "var(--text-primary)" }}
                >
                    Knowledge Base
                </h2>
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    8 files in 3 folders
                </p>
            </div>

            {/* ── Search ── */}
            <div className="px-3 pt-1 pb-3">
                <div
                    className="h-[34px] rounded-[10px] flex items-center px-4"
                    style={{ background: "var(--bg-input)" }}
                >
                    <span className="text-[12.5px]" style={{ color: "var(--text-placeholder)" }}>
                        Search files and folders...
                    </span>
                </div>
            </div>

            {/* ── File tree ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-3">
                {folders.map((folder, fi) => (
                    <div key={folder.name}>
                        {/* Folder row */}
                        <div className="flex items-center gap-2 py-2 cursor-pointer">
                            <span className="text-[17px]">{folder.icon}</span>
                            <span
                                className="text-[13px] font-medium flex-1"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {folder.name}
                            </span>
                            <span
                                className="text-[11px] min-w-[22px] h-[18px] rounded-full flex items-center justify-center"
                                style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}
                            >
                                {folder.count}
                            </span>
                            <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>
                                {folder.expanded ? "▾" : "▸"}
                            </span>
                        </div>

                        {/* Files */}
                        {folder.expanded &&
                            folder.files.map((file) => {
                                const fc = fileTypeColor(file.type);
                                return (
                                    <div
                                        key={file.name}
                                        className="flex items-center gap-2.5 pl-6 py-1.5 cursor-pointer"
                                    >
                                        {/* Type badge */}
                                        <div
                                            className="w-[24px] h-[24px] min-w-[24px] rounded-[5px] flex items-center justify-center"
                                            style={{ background: fc.bg }}
                                        >
                                            <span
                                                className="text-[8.5px] font-bold"
                                                style={{ color: fc.text }}
                                            >
                                                {file.type}
                                            </span>
                                        </div>

                                        {/* Name + meta */}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span
                                                className="text-xs truncate"
                                                style={{ color: "var(--text-primary)", fontWeight: 450 }}
                                            >
                                                {file.name}
                                            </span>
                                            <span className="text-[10.5px]" style={{ color: "var(--text-muted)" }}>
                                                {file.size} · {file.chunks}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        {statusBadge(file.status)}
                                    </div>
                                );
                            })}

                        {/* Separator between folders */}
                        {fi < folders.length - 1 && (
                            <div
                                className="my-2"
                                style={{ borderTop: "1px solid var(--border-light)" }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Upload zone ── */}
            <div className="px-3 pb-5 pt-2">
                <div
                    className="h-[40px] rounded-xl flex items-center justify-center cursor-pointer"
                    style={{
                        border: "1.5px dashed var(--border-dashed)",
                    }}
                >
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        <span className="font-medium" style={{ color: "var(--color-primary)" }}>
                            Drop files
                        </span>{" "}
                        or click to upload
                    </span>
                </div>
            </div>
        </aside>
    );
}
