import Navbar from '@/components/ui/Navbar';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import KnowledgeBase from '@/components/documents/KnowledgeBase';

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Main content — three-column layout below the 44px navbar */}
      <main className="flex gap-4 px-7 pb-5 pt-[72px] h-screen box-border">
        <ChatSidebar />
        <ChatArea />
        <KnowledgeBase />
      </main>
    </>
  );
}
