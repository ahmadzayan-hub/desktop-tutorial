import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-rta-navy" aria-hidden />
            <span className="display-tight text-lg font-semibold text-rta-navy">
              Mutabasir
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Sign up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-wide text-rta-red">
              Government Executive Intelligence
            </p>
            <h1 className="display-tight text-5xl font-bold leading-tight text-rta-navy">
              Board-grade dashboards from project documents — in 90 seconds.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Mutabasir reads your contracts, monthly reports, BAFOs, meeting
              minutes and invoices, then composes a bilingual executive
              dashboard in the RTA design system. Every number cites its
              source.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up">
                <Button size="lg">Start a project</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="secondary" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Sample dashboard
                </p>
                <p className="display-tight text-lg font-semibold text-rta-navy">
                  SENER Contract · Director Review
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-status-amber"
                />
                <span className="text-xs font-medium text-amber-900">
                  Watch
                </span>
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Value", value: "AED 12.4M" },
                { label: "Invoiced", value: "AED 7.8M" },
                { label: "Remaining", value: "AED 4.6M" },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {tile.label}
                  </p>
                  <p className="num mt-1 text-base font-semibold text-rta-navy">
                    {tile.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-sm">
              {[
                { color: "bg-status-green", text: "Mobilisation complete" },
                { color: "bg-status-amber", text: "33kV study under review" },
                { color: "bg-status-red", text: "Penalty exposure on M5" },
              ].map((row) => (
                <div
                  key={row.text}
                  className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2"
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full ${row.color}`}
                  />
                  <span className="text-slate-700">{row.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Built by Beyond Connect General Trading L.L.C ·{" "}
            <span dir="rtl" lang="ar">
              متابصير
            </span>
          </p>
          <p>mutabasir.ae</p>
        </div>
      </footer>
    </main>
  );
}
