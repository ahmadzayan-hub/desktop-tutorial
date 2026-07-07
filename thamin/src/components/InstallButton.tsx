'use client';

import { useEffect, useState } from 'react';

// Captures the browser's install prompt so the app can be installed on
// Android with one tap, exactly like a store app.
export default function InstallButton({ ar }: { ar: boolean }) {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setInstalled(true));
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (installed) {
    return (
      <p className="rounded-xl bg-green-50 p-4 text-center font-semibold text-green-700">
        {ar ? 'التطبيق مثبت على جهازك' : 'The app is installed on your device'} ✓
      </p>
    );
  }

  if (deferred) {
    return (
      <button
        className="btn-gold w-full text-lg"
        onClick={async () => {
          deferred.prompt();
          const choice = await deferred.userChoice;
          if (choice?.outcome === 'accepted') setInstalled(true);
          setDeferred(null);
        }}
      >
        {ar ? 'تثبيت التطبيق الآن' : 'Install the app now'} ⬇
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl bg-luxe p-4 text-sm leading-7">
      {ios ? (
        <p>
          {ar
            ? 'على أجهزة آيفون: افتح قائمة المشاركة في المتصفح ثم اختر "إضافة إلى الشاشة الرئيسية".'
            : 'On iPhone: open the browser share menu, then choose "Add to Home Screen".'}
        </p>
      ) : (
        <p>
          {ar
            ? 'على أندرويد: افتح قائمة المتصفح (النقاط الثلاث) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
            : 'On Android: open the browser menu (three dots), then choose "Install app" or "Add to Home screen".'}
        </p>
      )}
    </div>
  );
}
