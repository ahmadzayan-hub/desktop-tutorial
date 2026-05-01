"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useT } from "@/lib/i18n/I18nProvider";

export default function LoginPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const sb = getBrowserSupabase();
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/workspace` }
      });
      if (error) setError(error.message);
      else setSent(true);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
      <p className="text-slate-600 text-sm mt-1">{t("login.subtitle")}</p>
      <form onSubmit={send} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.placeholder")}
          className="w-full"
        />
        <button type="submit" className="btn-primary w-full">{t("login.btn.send")}</button>
        {sent && <p className="text-sm text-emerald-600">{t("login.sent")}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}
