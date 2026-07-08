'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n/dict';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Enables instant push notifications for pending approvals (managers/admin).
export default function NotificationSetup({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const [state, setState] = useState<'loading' | 'unsupported' | 'unconfigured' | 'off' | 'on'>('loading');
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState('unsupported');
        return;
      }
      const res = await fetch('/api/push/subscribe');
      const data = await res.json().catch(() => ({}));
      if (!data.configured) {
        setState('unconfigured');
        return;
      }
      setPublicKey(data.publicKey);
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? 'on' : 'off');
    })().catch(() => setState('unsupported'));
  }, []);

  async function enable() {
    setError('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError(ar ? 'تم رفض إذن الإشعارات من المتصفح.' : 'Notification permission was denied by the browser.');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Subscribe failed');
      setState('on');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setState('off');
  }

  return (
    <div className="card space-y-2">
      <h2 className="font-bold">{ar ? 'إشعارات الاعتمادات الفورية' : 'Instant approval notifications'}</h2>
      <p className="text-xs text-neutral-500">
        {ar
          ? 'عند إرسال أي منتج للاعتماد، يصل إشعار فوري إلى أجهزة المدراء المشتركين حتى والتطبيق مغلق.'
          : 'When a product is submitted for approval, subscribed managers get an instant notification even when the app is closed.'}
      </p>
      {state === 'loading' && <p className="text-sm text-neutral-400">…</p>}
      {state === 'unsupported' && (
        <p className="rounded-xl bg-neutral-100 p-3 text-sm text-neutral-500">
          {ar ? 'هذا المتصفح لا يدعم الإشعارات.' : 'This browser does not support push notifications.'}
        </p>
      )}
      {state === 'unconfigured' && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {ar
            ? 'الإشعارات غير مفعلة بعد على الخادم. شغّل npm run push:keys وأضف مفاتيح VAPID إلى البيئة.'
            : 'Push is not configured on the server yet. Run npm run push:keys and add the VAPID keys to the environment.'}
        </p>
      )}
      {state === 'off' && (
        <button className="btn-gold" onClick={enable}>
          {ar ? 'تفعيل الإشعارات على هذا الجهاز' : 'Enable notifications on this device'}
        </button>
      )}
      {state === 'on' && (
        <div className="flex items-center gap-3">
          <span className="badge bg-green-100 text-green-700">{ar ? 'مفعلة على هذا الجهاز' : 'Enabled on this device'}</span>
          <button className="text-xs font-semibold text-neutral-500 underline-offset-4 hover:underline" onClick={disable}>
            {ar ? 'إيقاف' : 'Disable'}
          </button>
        </div>
      )}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
