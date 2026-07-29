"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const { locale, dir } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const passwordStrength = form.password.length === 0 ? 0
    : form.password.length < 8 ? 1
    : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 3
    : 2;

  const strengthLabel = ["", locale === "ar" ? "ضعيفة" : "Weak", locale === "ar" ? "متوسطة" : "Fair", locale === "ar" ? "قوية" : "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError(locale === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (locale === "ar" ? "حدث خطأ. يرجى المحاولة مجدداً." : "Something went wrong. Please try again."));
      } else if (data.confirm_email) {
        setSuccess(true);
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setError(locale === "ar" ? "تعذّر الاتصال. تحقق من اتصالك بالإنترنت." : "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4" dir={dir}>
        <div className="w-full max-w-md text-center bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 p-10">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {locale === "ar" ? "تحقق من بريدك الإلكتروني" : "Check your email"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {locale === "ar"
              ? `أرسلنا رابط التحقق إلى ${form.email}`
              : `We sent a confirmation link to ${form.email}`}
          </p>
          <Link href="/login" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium">
            {locale === "ar" ? "العودة لتسجيل الدخول" : "Back to sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12" dir={dir}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-brand-700 dark:text-brand-400 font-bold text-xl">
            <GraduationCap size={32} />
            <span>Tweenz AI</span>
          </Link>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            {locale === "ar" ? "أنشئ حسابك مجاناً" : "Create your free account"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "ar" ? "الاسم الكامل" : "Full name"}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                required
                autoComplete="name"
                placeholder={locale === "ar" ? "سارة المنصوري" : "Sara Al-Mansouri"}
                className="input w-full"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "ar" ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                required
                autoComplete="email"
                placeholder="you@university.edu"
                className="input w-full"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {locale === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={locale === "ar" ? "٨ أحرف على الأقل" : "Min. 8 characters"}
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
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor[passwordStrength] : "bg-slate-200 dark:bg-slate-700"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[40px]">{strengthLabel[passwordStrength]}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              {locale === "ar"
                ? <>بالتسجيل، أنت توافق على <Link href="/terms" className="underline">شروط الاستخدام</Link> و<Link href="/privacy" className="underline">سياسة الخصوصية</Link></>
                : <>By signing up you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link></>
              }
            </p>

            {/* Submit */}
            <Button type="submit" fullWidth disabled={loading} className="h-11">
              {loading ? <Loader2 size={17} className="animate-spin" /> : (locale === "ar" ? "إنشاء الحساب" : "Create account")}
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {locale === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
              {locale === "ar" ? "تسجيل الدخول" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
