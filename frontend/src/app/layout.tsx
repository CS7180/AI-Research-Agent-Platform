import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocMind — AI Research Agent",
  description:
    "AI-powered research agent platform for CS students. Upload documents, build a knowledge base, and ask questions grounded in your own course materials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
