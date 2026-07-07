'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LogoMark } from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push(params.get('next') || '/');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
      <div>
        <label className="label">Email | البريد الإلكتروني</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <label className="label">Password | كلمة المرور</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button className="btn-gold w-full" disabled={busy}>
        {busy ? '…' : 'Log in | تسجيل الدخول'}
      </button>
      <p className="text-center text-xs text-neutral-400">
        Demo: admin@beyondstyle.ae / Admin@123
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-4">
      <div className="text-center">
        <div className="mx-auto mb-3 w-fit"><LogoMark size={64} /></div>
        <h1 className="text-2xl font-bold text-gold">ثمين | Thamin</h1>
        <p className="text-sm text-white/70">منصة التسعير الذكي | Smart Pricing Platform</p>
        <p className="mt-1 text-xs text-white/50">Beyond Style UAE</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
