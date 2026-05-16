import Link from "next/link";
import { Wordmark } from "@/components/branding/wordmark";
import { LocaleToggle } from "@/components/branding/locale-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-rta-navy/10 blur-3xl"
      />
      <header className="relative border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/">
            <Wordmark size="md" />
          </Link>
          <LocaleToggle />
        </div>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
