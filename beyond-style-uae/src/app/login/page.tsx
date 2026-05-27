"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function signIn() {
    setMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else window.location.href = "/";
    } catch {
      setMsg("Supabase is not configured yet. Set the env vars to enable login.");
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-1 text-xl font-semibold">Beyond Style UAE</h1>
      <p className="mb-4 text-sm text-gray-500">Order Control Console — owner / operator sign in.</p>
      <div className="card flex flex-col gap-3">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={signIn}>Sign in</button>
        {msg && <p className="text-sm text-red-700">{msg}</p>}
      </div>
    </div>
  );
}
