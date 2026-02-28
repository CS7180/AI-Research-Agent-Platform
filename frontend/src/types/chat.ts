/** Chat session displayed in the left sidebar. */
export interface ChatSession {
    id: number;
    title: string;
    time: string;
    active: boolean;
}

/** A source citation returned by the RAG pipeline. */
export interface Source {
    name: string;
    type: 'PDF' | 'MD' | 'TXT';
    location: string;
}

/** A single chat message (user or assistant). */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
}
