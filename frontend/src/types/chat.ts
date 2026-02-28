/** Represents a single chat session in the sidebar. */
export interface ChatSession {
    id: string;
    title: string;
    timestamp: string;
    isActive: boolean;
}

/** Represents a source document cited in an AI response. */
export interface Source {
    id: string;
    filename: string;
    fileType: 'PDF' | 'MD' | 'TXT';
    location: string;
}

/** Metadata about the retrieval process for a response. */
export interface RetrievalMeta {
    toolUsed: string;
    docCount: number;
    latency: string;
}

/** Represents a single chat message (user or AI). */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
    retrievalMeta?: RetrievalMeta;
}
