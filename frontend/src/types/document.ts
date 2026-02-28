/** Processing status of a document in the knowledge base. */
export type DocumentStatus = 'READY' | 'PROCESSING' | 'PENDING' | 'FAILED';

/** Represents a file in the knowledge base. */
export interface DocumentFile {
    id: string;
    filename: string;
    fileType: 'PDF' | 'MD' | 'TXT';
    size: string;
    chunks: number;
    status: DocumentStatus;
}

/** Represents a folder in the knowledge base. */
export interface Folder {
    id: string;
    name: string;
    fileCount: number;
    isExpanded: boolean;
    files: DocumentFile[];
}
