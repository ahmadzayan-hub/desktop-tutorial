import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockSession } from "@/lib/store/mock-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/projects" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-rta-navy" aria-hidden />
            <span className="display-tight text-lg font-semibold text-rta-navy">
              Mutabasir
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                Projects
              </Button>
            </Link>
            <Link href="/new">
              <Button variant="ghost" size="sm">
                New project
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
            <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3 text-sm text-slate-600">
              <span className="hidden sm:inline">{mockSession.user.email}</span>
              <Link href="/">
                <Button variant="secondary" size="sm">
                  Sign out
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <p>Mutabasir · Phase 1 scaffold</p>
          <p>mutabasir.ae</p>
        </div>
      </footer>
    </div>
  );
}
