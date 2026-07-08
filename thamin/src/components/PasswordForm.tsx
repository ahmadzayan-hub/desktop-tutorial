'use client';

import { useState } from 'react';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

export default function PasswordForm({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  const ar = locale === 'ar';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setError('');
    if (next !== confirm) {
      setError(ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setBusy(true);
    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setMsg(ar ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    setCurrent('');
    setNext('');
    setConfirm('');
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h2 className="font-bold">{ar ? 'تغيير كلمة المرور' : 'Change password'}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="label">{ar ? 'كلمة المرور الحالية' : 'Current password'}</label>
          <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
        </div>
        <div>
          <label className="label">{ar ? 'كلمة المرور الجديدة (8 أحرف على الأقل)' : 'New password (min 8 characters)'}</label>
          <input className="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label className="label">{ar ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}</label>
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {msg && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{msg}</p>}
      <button className="btn-gold" disabled={busy}>{busy ? '…' : t.save}</button>
    </form>
  );
}
