import type { Metadata } from "next";
import "./globals.css";
import { ClientSessionProvider } from "@/components/ClientSessionProvider";
import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import { DndProvider } from "@/components/providers/DndProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NotebookLM AI",
  description: "AI-powered document management and summarization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DndProvider>
          <AuthProvider>
            <ClientSessionProvider>
              <Navbar />
              <main className="p-4 max-w-4xl mx-auto">{children}</main>
              <Toaster richColors position="top-right" />
            </ClientSessionProvider>
          </AuthProvider>
        </DndProvider>
      </body>
    </html>
  );
}
