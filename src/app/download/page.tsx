"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "desktop";
}

export default function DownloadPage() {
  const { dir } = useI18n();
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());

    // Capture the native install prompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installPWA() {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt as BeforeInstallPromptEvent;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-sky-800 flex flex-col items-center justify-center px-4 py-16 text-white" dir={dir}>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl">
          <img src="/icon.svg" alt="Tweenz AI" className="w-16 h-16" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Tweenz AI</h1>
          <p className="text-blue-200 mt-1 text-sm">منصة التعلم الذكي لطلاب الماجستير</p>
        </div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">

        {installed ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">التطبيق مثبّت</h2>
            <p className="text-blue-200 text-sm">يمكنك الآن فتح Tweenz AI من شاشتك الرئيسية مباشرةً.</p>
            <Link href="/dashboard" className="block w-full text-center bg-white text-blue-900 font-semibold py-3 rounded-2xl mt-4 hover:bg-blue-50 transition">
              فتح التطبيق
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center mb-2">ثبّت التطبيق على جهازك</h2>
            <p className="text-blue-200 text-sm text-center mb-8">
              Tweenz AI متاح كتطبيق مجاني مباشرةً من المتصفح — بلا متجر تطبيقات.
            </p>

            {/* Android */}
            {(platform === "android" || platform === "desktop") && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <AndroidIcon />
                  </div>
                  <span className="font-semibold">Android</span>
                </div>

                {deferredPrompt ? (
                  <button
                    onClick={installPWA}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 text-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    تثبيت التطبيق الآن
                  </button>
                ) : (
                  <ol className="space-y-3 text-sm text-blue-100">
                    <Step n={1} text="افتح هذا الرابط في متصفح Chrome على هاتفك." />
                    <Step n={2} text="اضغط على زر النقاط الثلاث ⋮ في أعلى يمين المتصفح." />
                    <Step n={3} text='اختر "إضافة إلى الشاشة الرئيسية".' />
                    <Step n={4} text='اضغط "إضافة" للتأكيد.' />
                  </ol>
                )}
              </div>
            )}

            {/* iOS */}
            {(platform === "ios" || platform === "desktop") && (
              <div className="mb-6 space-y-3 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-500/20 flex items-center justify-center flex-shrink-0">
                    <AppleIcon />
                  </div>
                  <span className="font-semibold">iPhone / iPad</span>
                </div>
                <ol className="space-y-3 text-sm text-blue-100">
                  <Step n={1} text="افتح هذا الرابط في Safari على جهازك." />
                  <Step n={2} text='اضغط زر المشاركة 　 في أسفل الشاشة.' />
                  <Step n={3} text='"إضافة إلى الشاشة الرئيسية" ثم اضغط "إضافة".' />
                </ol>
              </div>
            )}

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
              {[
                { icon: "⚡", label: "سريع وخفيف" },
                { icon: "📴", label: "يعمل بلا إنترنت" },
                { icon: "🔔", label: "إشعارات فورية" },
                { icon: "🔒", label: "آمن وخاص" },
              ].map(f => (
                <div key={f.label} className="bg-white/5 rounded-2xl p-3 text-center">
                  <span className="text-2xl">{f.icon}</span>
                  <p className="text-xs text-blue-200 mt-1">{f.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Link href="/" className="mt-8 text-blue-300 hover:text-white text-sm transition">
        ← العودة إلى الرئيسية
      </Link>
    </main>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}

function AndroidIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// BeforeInstallPromptEvent is not in the standard lib
declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}
