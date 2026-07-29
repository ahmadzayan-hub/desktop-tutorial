"use client";
import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, CalendarDays, AlertTriangle, CheckCircle2, BookOpen, ClipboardList, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface Brief {
  id: string;
  week_start: string;
  week_end: string;
  summary: string;
  content: {
    courses_status?: string;
    urgent_items?: string[];
    upcoming_deadlines?: string[];
    grade_risks?: string[];
    recommended_study_plan?: string;
    weekend_plan?: string;
    instructor_questions?: string[];
  };
  created_at: string;
}

export default function WeeklyBriefPage() {
  const { t, locale, dir } = useI18n();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/weekly-brief")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setBrief(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/weekly-brief", { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? (locale === "ar" ? "فشل الإنشاء" : "Generation failed"));
      } else {
        const data = await res.json();
        setBrief(data);
      }
    } catch {
      setError(locale === "ar" ? "تعذّر الاتصال" : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  const weekRange = brief
    ? `${format(new Date(brief.week_start), "MMM d")} – ${format(new Date(brief.week_end), "MMM d, yyyy")}`
    : "";

  if (loading) return (
    <div className="space-y-4 animate-fade-in" dir={dir}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={22} className="text-brand-500" />
            {locale === "ar" ? "الموجز الأسبوعي" : "Weekly Brief"}
          </h1>
          {brief && (
            <p className="text-sm text-slate-400 mt-0.5">
              <CalendarDays size={13} className="inline me-1" />
              {weekRange}
            </p>
          )}
        </div>
        <Button
          onClick={generate}
          disabled={generating}
          size="sm"
          variant={brief ? "secondary" : "primary"}
        >
          {generating
            ? <><Loader2 size={15} className="animate-spin me-1.5" />{locale === "ar" ? "جارٍ الإنشاء…" : "Generating…"}</>
            : <><RefreshCw size={15} className="me-1.5" />{brief ? (locale === "ar" ? "تحديث" : "Regenerate") : (locale === "ar" ? "إنشاء الموجز" : "Generate Brief")}</>
          }
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {!brief && !generating && (
        <div className="card text-center py-16">
          <Sparkles size={40} className="mx-auto mb-4 text-brand-400 opacity-60" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {locale === "ar" ? "لا يوجد موجز لهذا الأسبوع بعد" : "No brief generated yet"}
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            {locale === "ar"
              ? "أنشئ موجزاً أسبوعياً مخصصاً يلخّص مواعيدك ودرجاتك وخطة دراستك."
              : "Generate a personalized weekly brief summarizing your deadlines, grades, and study plan."}
          </p>
          <Button onClick={generate} disabled={generating}>
            {locale === "ar" ? "إنشاء الموجز الآن" : "Generate Now"}
          </Button>
        </div>
      )}

      {brief && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="card border-s-4 border-s-brand-500">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
              {locale === "ar" ? "ملخص الأسبوع" : "Week Summary"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{brief.summary}</p>
          </div>

          {/* Urgent items */}
          {brief.content.urgent_items && brief.content.urgent_items.length > 0 && (
            <div className="card border-s-4 border-s-red-500">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3 text-sm flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {locale === "ar" ? "بنود عاجلة" : "Urgent Items"}
              </h3>
              <ul className="space-y-1.5">
                {brief.content.urgent_items.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upcoming deadlines */}
          {brief.content.upcoming_deadlines && brief.content.upcoming_deadlines.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-1.5">
                <CalendarDays size={14} className="text-amber-500" />
                {locale === "ar" ? "المواعيد القادمة" : "Upcoming Deadlines"}
              </h3>
              <ul className="space-y-1.5">
                {brief.content.upcoming_deadlines.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Study plan */}
          {brief.content.recommended_study_plan && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-1.5">
                <BookOpen size={14} className="text-brand-500" />
                {locale === "ar" ? "خطة الدراسة الأسبوعية" : "Weekly Study Plan"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {brief.content.recommended_study_plan}
              </p>
            </div>
          )}

          {/* Weekend plan */}
          {brief.content.weekend_plan && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {locale === "ar" ? "خطة نهاية الأسبوع" : "Weekend Plan"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {brief.content.weekend_plan}
              </p>
            </div>
          )}

          {/* Grade risks */}
          {brief.content.grade_risks && brief.content.grade_risks.length > 0 && (
            <div className="card border-s-4 border-s-amber-400">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-3 text-sm">
                {locale === "ar" ? "مخاطر الدرجات" : "Grade Risks"}
              </h3>
              <ul className="space-y-1.5">
                {brief.content.grade_risks.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructor questions */}
          {brief.content.instructor_questions && brief.content.instructor_questions.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-1.5">
                <ClipboardList size={14} className="text-purple-500" />
                {locale === "ar" ? "أسئلة للمحاضر" : "Questions for Instructors"}
              </h3>
              <ul className="space-y-1.5">
                {brief.content.instructor_questions.map((q, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="shrink-0 font-bold text-purple-500">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-center text-slate-400">
            {locale === "ar" ? "تم الإنشاء" : "Generated"} {format(new Date(brief.created_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      )}
    </div>
  );
}
