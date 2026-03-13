import Navbar from '@/components/Navbar';
import ChatArea from '@/components/chat/ChatArea';
import KnowledgeSidebar from '@/components/documents/KnowledgeSidebar';
import { listDocumentsServer } from '@/backend/server';

export default async function Home() {
  const documents = await listDocumentsServer();

  return (
    <div className="flex h-screen flex-col">
      <Navbar docsCount={documents.length} />
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] gap-4 overflow-hidden p-4">
        <ChatArea />
        <KnowledgeSidebar documents={documents} />
      </main>
    </div>
  );
}
