"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = getBrowserSupabase();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/workspace` }
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-slate-600 text-sm mt-1">
        We'll email you a magic link. No password required.
      </p>
      <form onSubmit={send} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full"
        />
        <button type="submit" className="btn-primary w-full">Send magic link</button>
        {sent && <p className="text-sm text-emerald-600">Check your inbox.</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
