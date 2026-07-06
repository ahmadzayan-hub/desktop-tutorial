"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const capture = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", capture as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function signIn() {
    setMsg(null);
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else window.location.href = "/";
    } catch {
      setMsg("Supabase is not configured. Use the demo entry below to explore.");
    } finally {
      setLoading(false);
    }
  }

  async function install() {
    if (!installEvt) return;
    await installEvt.prompt();
    const choice = await installEvt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvt(null);
  }

  return (
    <div className="mx-auto mt-8 max-w-md md:mt-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <LogoMark size={72} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{BRAND.name}</h1>
          <p dir="rtl" className="rtl text-lg font-semibold text-[color:rgb(var(--brand))]">{BRAND.nameAr}</p>
        </div>
        <div className="max-w-xs">
          <p className="muted">{BRAND.tagline}</p>
          <p dir="rtl" className="rtl muted mt-1">{BRAND.taglineAr}</p>
        </div>
      </div>

      <div className="card flex flex-col gap-3">
        <div>
          <label className="label" htmlFor="email">Email · البريد الإلكتروني</label>
          <input
            id="email"
            className="input"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password · كلمة المرور</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={signIn} disabled={loading}>
          {loading ? "Signing in…" : "Sign in · تسجيل الدخول"}
        </button>
        {msg && <p className="text-sm text-[color:rgb(var(--danger))]">{msg}</p>}

        <div className="flex items-center gap-2 py-1 text-xs text-[color:rgb(var(--ink-3))]">
          <span className="h-px flex-1 bg-[color:rgb(var(--line))]" />
          <span>or · أو</span>
          <span className="h-px flex-1 bg-[color:rgb(var(--line))]" />
        </div>

        <Link href="/" className="btn btn-accent justify-center">
          Enter as demo owner · دخول تجريبي
        </Link>
        <p className="text-center text-xs muted">
          Demo mode uses seeded data, no Supabase required. Connect a real Supabase project to enable production sign-in.
        </p>
        <p dir="rtl" className="rtl text-center text-xs muted">
          الوضع التجريبي يستخدم بيانات جاهزة، ولا يحتاج إلى Supabase. اربط مشروع Supabase حقيقياً لتفعيل الدخول للإنتاج.
        </p>
      </div>

      {/* Install as an app · Android / desktop. */}
      <div className="mt-4 card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium">Install {BRAND.name} on your device</div>
            <div className="muted text-xs">
              Works on Android, iPhone, and desktop. No app store required.
            </div>
            <div dir="rtl" className="rtl muted mt-1 text-xs">
              يعمل على أندرويد وآيفون وسطح المكتب. بدون متجر تطبيقات.
            </div>
          </div>
          {installed ? (
            <span className="badge badge-pass">Installed · مُثبَّت</span>
          ) : installEvt ? (
            <button className="btn btn-primary" onClick={install}>
              Install app · تثبيت
            </button>
          ) : (
            <details className="text-xs muted">
              <summary className="cursor-pointer">How to install</summary>
              <p className="mt-2">
                Android Chrome: menu (⋮) → <em>Install app</em>. iOS Safari: share → <em>Add to Home Screen</em>.
              </p>
              <p dir="rtl" className="rtl mt-2">
                أندرويد كروم: القائمة (⋮) ثم <em>تثبيت التطبيق</em>. آيفون سفاري: مشاركة ثم <em>إضافة إلى الشاشة الرئيسية</em>.
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// beforeinstallprompt isn't in stock lib.dom.d.ts. Declare the minimum shape.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
