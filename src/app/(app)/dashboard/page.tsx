"use client";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BookOpen, Clock, Megaphone, BarChart3, Bot, Package, Newspaper,
  AlertTriangle, CheckCircle, TrendingUp, Zap, Plus, ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface Course { id: string; name: string; code: string; progress: number; instructor: string; }
interface Deadline { id: string; title: string; course_name: string; due_date: string; risk: "safe"|"due_soon"|"at_risk"|"overdue"; type: string; }
interface Announcement { id: string; title: string; summary: string; risk_level: string; course_name: string; created_at: string; }

export default function DashboardPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cRes, dRes, aRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/deadlines?view=week"),
          fetch("/api/announcements?limit=5"),
        ]);
        if (cRes.ok) setCourses(await cRes.json());
        if (dRes.ok) setDeadlines(await dRes.json());
        if (aRes.ok) setAnnouncements(await aRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "dashboard.greeting.morning" : hour < 17 ? "dashboard.greeting.afternoon" : "dashboard.greeting.evening";
  const greeting = t(greetingKey as any, { name: "Student" });

  const riskColors: Record<string, "red"|"yellow"|"green"|"blue"> = {
    overdue: "red", at_risk: "red", due_soon: "yellow", safe: "green"
  };

  const riskLabels: Record<string, string> = {
    overdue: t("dashboard.overdue"),
    at_risk: t("dashboard.at_risk"),
    due_soon: t("dashboard.due_soon"),
    safe: "Safe",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting + focus question */}
      <div className="bg-gradient-to-br from-brand-600 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">{greeting}</h1>
        <p className="text-white/80 text-sm mb-4">{t("dashboard.focus")}</p>
        <Link href="/ask-mba">
          <button className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition">
            <Bot size={16} />
            Ask My MBA Agent
            <ArrowRight size={14} />
          </button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen size={20} className="text-brand-600" />, label: t("dashboard.courses_active"), value: courses.filter(c => true).length, href: "/courses", bg: "bg-brand-50 dark:bg-brand-950/30" },
          { icon: <Clock size={20} className="text-amber-600" />, label: t("dashboard.upcoming_deadlines"), value: deadlines.length, href: "/timeline", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { icon: <Megaphone size={20} className="text-purple-600" />, label: t("dashboard.unread_announcements"), value: announcements.length, href: "/announcements", bg: "bg-purple-50 dark:bg-purple-950/30" },
          { icon: <BarChart3 size={20} className="text-emerald-600" />, label: t("dashboard.exam_readiness"), value: "72%", href: "/grades", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        ].map(stat => (
          <Link key={stat.label} href={stat.href}>
            <div className={`card-hover cursor-pointer ${stat.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("nav.courses")}</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                <Plus size={15} />
                {t("courses.add")}
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen />}
              title={t("dashboard.no_courses")}
              action={{ label: t("dashboard.add_course"), onClick: () => window.location.href = "/courses" }}
            />
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map(c => (
                <Link key={c.id} href={`/courses/${c.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.instructor}</p>
                      <Progress value={c.progress} size="sm" className="mt-1.5" />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{c.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.upcoming_deadlines")}</h2>
            <Link href="/timeline">
              <Button variant="ghost" size="sm">
                {t("timeline.add")}
                <Plus size={15} />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : deadlines.length === 0 ? (
            <EmptyState icon={<Clock />} title={t("timeline.empty")} />
          ) : (
            <div className="space-y-2.5">
              {deadlines.slice(0, 6).map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  {d.risk === "overdue" || d.risk === "at_risk"
                    ? <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                    : d.risk === "due_soon"
                    ? <Clock size={16} className="text-amber-500 flex-shrink-0" />
                    : <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                    <p className="text-xs text-slate-400">{d.course_name}</p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <Badge color={riskColors[d.risk] || "gray"}>{riskLabels[d.risk]}</Badge>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(d.due_date), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-teal-100 dark:bg-teal-950/40 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-teal-600" />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.ai_recommendations")}</h2>
          <span className="badge-blue text-xs">{t("label.ai")}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Package size={18} className="text-purple-600" />, title: "Generate Study Pack", body: "Strategic Management Lecture 3 is processed. Generate your study pack now.", href: "/study-packs", color: "bg-purple-50 dark:bg-purple-950/30" },
            { icon: <Zap size={18} className="text-amber-600" />, title: "Review Flashcards", body: "18 flashcards pending review for Finance module.", href: "/flashcards", color: "bg-amber-50 dark:bg-amber-950/30" },
            { icon: <Bot size={18} className="text-brand-600" />, title: "Ask Your Tutor", body: "You have an exam in 5 days. Start exam prep with your AI tutor.", href: "/tutor", color: "bg-brand-50 dark:bg-brand-950/30" },
          ].map((r, i) => (
            <Link key={i} href={r.href}>
              <div className={`flex gap-3 p-4 rounded-xl cursor-pointer hover:shadow-card-hover transition ${r.color}`}>
                <div className="flex-shrink-0 mt-0.5">{r.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{r.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.body}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("nav.announcements")}</h2>
            <Link href="/announcements">
              <Button variant="ghost" size="sm">View all <ArrowRight size={14} /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <Megaphone size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                  {a.summary && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{a.summary}</p>}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{a.course_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/study-packs", icon: <Package size={20} />, label: t("nav.study_packs"), color: "text-purple-600 bg-purple-100 dark:bg-purple-950/40" },
          { href: "/tutor", icon: <Bot size={20} />, label: t("nav.tutor"), color: "text-teal-600 bg-teal-100 dark:bg-teal-950/40" },
          { href: "/weekly-brief", icon: <Newspaper size={20} />, label: t("nav.weekly_brief"), color: "text-brand-600 bg-brand-100 dark:bg-brand-950/40" },
          { href: "/ask-mba", icon: <TrendingUp size={20} />, label: t("nav.ask_mba"), color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40" },
        ].map(qa => (
          <Link key={qa.href} href={qa.href}>
            <div className="card-hover flex flex-col items-center gap-2.5 py-5 text-center cursor-pointer">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${qa.color}`}>
                {qa.icon}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{qa.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
