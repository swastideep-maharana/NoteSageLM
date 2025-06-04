import type { Metadata } from "next";
import "./globals.css";
import { ClientSessionProvider } from "@/components/ClientSessionProvider";
import { Inter } from "next/font/google";
import { DndProvider } from "@/components/providers/DndProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NotebookLM AI - Your AI-Powered Note-Taking Assistant",
  description: "An intelligent note-taking platform powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientSessionProvider>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1400px] mx-auto w-full">
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <Toaster position="top-right" />
          </ClientSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
