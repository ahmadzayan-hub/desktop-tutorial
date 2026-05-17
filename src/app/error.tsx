"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/branding/wordmark";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Mutabasir] route error:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <Wordmark href="/" size="lg" showTagline className="justify-center" />
        <p className="display-tight mt-10 text-5xl font-bold text-brand-red sm:text-6xl">
          Oops
        </p>
        <h1 className="display-tight mt-4 text-2xl font-semibold text-slate-800">
          Something interrupted this page.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          The error has been logged. You can try again, or return home.
        </p>
        {error.digest && (
          <p className="mt-4 inline-block rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-500">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
