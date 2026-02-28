import Navbar from '@/components/ui/Navbar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import KnowledgeBaseSidebar from '@/components/documents/KnowledgeBaseSidebar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex h-screen gap-7 px-7 pt-[72px] pb-7">
        <ChatSidebar />
        <ChatArea />
        <KnowledgeBaseSidebar />
      </main>
    </>
  );
}
