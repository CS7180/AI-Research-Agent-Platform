/** Processing status for an uploaded document. */
export type DocumentStatus = 'READY' | 'PROCESSING' | 'PENDING' | 'FAILED';

/** Supported document file types. */
export type FileType = 'PDF' | 'MD' | 'TXT';

/** A single file in the knowledge base. */
export interface FileItem {
    name: string;
    size: string;
    chunks: string;
    type: FileType;
    status: DocumentStatus;
}

/** A folder grouping files in the knowledge base. */
export interface Folder {
    name: string;
    icon: string;
    count: number;
    expanded: boolean;
    files: FileItem[];
}
