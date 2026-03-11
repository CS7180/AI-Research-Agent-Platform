import Navbar from '@/components/Navbar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import KnowledgeSidebar from '@/components/documents/KnowledgeSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        <Navbar />
        <main className="grid flex-1 grid-cols-[260px_1fr_280px] gap-4 overflow-hidden p-4">
          <ChatSidebar />
          <ChatArea />
          <KnowledgeSidebar />
        </main>
      </div>
    </AuthGuard>
  );
}
