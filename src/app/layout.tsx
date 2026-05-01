import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Orchestrator",
  description: "Turn raw ideas into perfectly engineered prompts."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
              <a href="/" className="font-semibold tracking-tight">Prompt Orchestrator</a>
              <nav className="flex gap-1 text-sm">
                <a href="/workspace" className="btn-ghost">Workspace</a>
                <a href="/templates" className="btn-ghost">Templates</a>
                <a href="/history" className="btn-ghost">History</a>
                <a href="/login" className="btn-ghost">Sign in</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-500">
              100% free stack: Next.js + Supabase + Ollama + Vercel.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
