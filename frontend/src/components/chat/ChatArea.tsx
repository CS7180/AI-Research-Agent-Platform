import ChatMessage from '@/components/chat/ChatMessage';
import SourcesCard from '@/components/chat/SourcesCard';
import ChatInput from '@/components/chat/ChatInput';

const SOURCES = [
  { name: 'CS6650_Lecture11_2PC.pdf', type: 'pdf' as const, detail: 'slides 28-35' },
  { name: 'distributed_systems_notes.md', type: 'md' as const, detail: 'chunk 3' },
];

export default function ChatArea() {
  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-surface">
      {/* Header */}
      <header className="border-b border-border-light px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">What is 2PC?</h1>
        <p className="text-xs text-muted-light">Based on your distributed systems notes</p>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* User message */}
        <ChatMessage variant="user">What is Two-Phase Commit?</ChatMessage>

        {/* Assistant response */}
        <ChatMessage variant="assistant">
          <div className="space-y-3">
            <p>
              Two-Phase Commit (2PC) is a distributed protocol that ensures all nodes
              either <strong>commit</strong> or <strong>abort</strong> a transaction
              together. From your{' '}
              <span className="font-medium text-primary">Lecture 11</span> slides:
            </p>
            <p>
              <strong>Phase 1</strong> — the coordinator sends{' '}
              <code className="rounded bg-border-light px-1.5 py-0.5 text-xs font-mono">
                PREPARE
              </code>{' '}
              and each participant votes YES or NO.
            </p>
            <p>
              <strong>Phase 2</strong> — if all voted YES, broadcast{' '}
              <code className="rounded bg-border-light px-1.5 py-0.5 text-xs font-mono">
                COMMIT
              </code>
              ; otherwise{' '}
              <code className="rounded bg-border-light px-1.5 py-0.5 text-xs font-mono">
                ABORT
              </code>
              .
            </p>
            <p>
              The key trade-off: 2PC guarantees atomicity but can{' '}
              <em>block</em> if the coordinator fails mid-protocol.
            </p>
          </div>
        </ChatMessage>

        {/* Sources */}
        <div className="ml-8">
          <SourcesCard sources={SOURCES} />
        </div>
      </div>

      {/* Input */}
      <ChatInput />
    </section>
  );
}
