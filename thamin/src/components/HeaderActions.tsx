'use client';

import { useRouter } from 'next/navigation';

export function LangSwitch({ current }: { current: 'en' | 'ar' }) {
  const router = useRouter();
  const next = current === 'ar' ? 'en' : 'ar';
  return (
    <button
      className="rounded-lg border border-gold/60 px-2.5 py-1 text-xs font-semibold text-gold"
      onClick={() => {
        document.cookie = `bsp_locale=${next};path=/;max-age=31536000`;
        router.refresh();
      }}
    >
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      className="rounded-lg px-2 py-1 text-xs text-white/70 hover:text-white"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
