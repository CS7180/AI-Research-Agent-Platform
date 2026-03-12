import Navbar from '@/components/Navbar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import KnowledgeSidebar from '@/components/documents/KnowledgeSidebar';
import { listDocumentsServer } from '@/backend/server';

export default async function Home() {
  const documents = await listDocumentsServer();

  return (
    <div className="flex h-screen flex-col">
      <Navbar docsCount={documents.length} />
      <main className="grid flex-1 grid-cols-[260px_1fr_280px] gap-4 overflow-hidden p-4">
        <ChatSidebar />
        <ChatArea />
        <KnowledgeSidebar documents={documents} />
      </main>
    </div>
  );
}
