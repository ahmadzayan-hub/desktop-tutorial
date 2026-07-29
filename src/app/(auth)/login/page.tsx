"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { t, locale, dir } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("auth.error.invalid" as any));
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(t("auth.error.network" as any));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError(t("auth.error.network" as any));
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@tweenz.ae", password: "demo" }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4" dir={dir}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-brand-700 dark:text-brand-400 font-bold text-xl">
            <GraduationCap size={32} />
            <span>Tweenz AI</span>
          </Link>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            {locale === "ar" ? "مرحباً بك مجدداً" : "Welcome back"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 p-8">
          {/* Demo mode banner */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium hover:bg-amber-100 transition dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
            >
              {locale === "ar" ? "جرّب النسخة التجريبية (بدون تسجيل)" : "Try Demo — no account needed"}
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "ar" ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder={locale === "ar" ? "you@example.com" : "you@example.com"}
                className="input w-full"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {locale === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <Link href="/reset-password" className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  {locale === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={locale === "ar" ? "••••••••" : "••••••••"}
                  className="input w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" fullWidth disabled={loading} className="h-11">
              {loading ? <Loader2 size={17} className="animate-spin" /> : (locale === "ar" ? "تسجيل الدخول" : "Sign in")}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400">
              <span className="bg-white dark:bg-slate-900 px-2">
                {locale === "ar" ? "أو" : "or"}
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {locale === "ar" ? "المتابعة عبر Google" : "Continue with Google"}
          </button>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {locale === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
            <Link href="/signup" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
              {locale === "ar" ? "إنشاء حساب" : "Sign up free"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
