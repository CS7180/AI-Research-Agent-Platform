'use client';

import { useState } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';
import SourcesCard from '@/components/chat/SourcesCard';
import ChatInput from '@/components/chat/ChatInput';
import { streamChatClient } from '@/backend/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SourceCardItem {
  name: string;
  type: 'pdf' | 'md' | 'txt';
  detail: string;
}

function toSourceType(filename: string): 'pdf' | 'md' | 'txt' {
  if (filename.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (filename.toLowerCase().endsWith('.md')) return 'md';
  return 'txt';
}

function mapSourcesToCardItems(sources: unknown[]): SourceCardItem[] {
  return sources
    .filter((source): source is { filename?: unknown; chunk_index?: unknown } => typeof source === 'object' && source !== null)
    .map((source) => {
      const name = typeof source.filename === 'string' ? source.filename : 'Unknown source';
      const chunkIndex = typeof source.chunk_index === 'number' ? source.chunk_index : null;
      return {
        name,
        type: toSourceType(name),
        detail: chunkIndex !== null ? `chunk ${chunkIndex}` : 'citation',
      };
    });
}

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sources, setSources] = useState<SourceCardItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  async function handleSubmit() {
    const message = input.trim();
    if (!message || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
    };
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };

    setInput('');
    setError(null);
    setSources([]);
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      await streamChatClient(message, {
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: `${msg.content}${token}` } : msg,
            ),
          );
        },
        onSources: (nextSources) => {
          setSources(mapSourcesToCardItems(nextSources));
        },
      });
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Failed to stream response.';
      setError(messageText);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-surface">
      <header className="border-b border-border-light px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Research Chat</h1>
        <p className="text-xs text-muted-light">Ask questions grounded in your uploaded documents</p>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">Ask your first question to start a real backend chat session.</p>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} variant={msg.role}>
              {msg.content || (msg.role === 'assistant' && isStreaming ? '...' : '')}
            </ChatMessage>
          ))
        )}

        {error && (
          <div className="rounded-lg border border-accent-red/30 bg-accent-red-bg px-3 py-2 text-xs text-accent-red">
            {error}
          </div>
        )}

        {sources.length > 0 && (
          <div className="ml-8">
            <SourcesCard sources={sources} />
          </div>
        )}
      </div>

      <ChatInput value={input} onChange={setInput} onSubmit={handleSubmit} disabled={isStreaming} />
    </section>
  );
}
