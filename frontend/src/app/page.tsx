import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import ChatArea from "@/components/ChatArea";
import RightSidebar from "@/components/RightSidebar";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Main content area — sits below the 44px navbar */}
      <div
        className="flex gap-4 px-7 pb-5"
        style={{ paddingTop: "calc(44px + 28px)", height: "100vh", boxSizing: "border-box" }}
      >
        <LeftSidebar />
        <ChatArea />
        <RightSidebar />
      </div>
    </>
  );
}
