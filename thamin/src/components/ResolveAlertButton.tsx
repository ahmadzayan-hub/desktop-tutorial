'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResolveAlertButton({ id, label }: { id?: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="badge bg-white/70 text-neutral-700 hover:bg-white"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(id ? { id } : { resolveAll: true }),
        });
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? '…' : label}
    </button>
  );
}
