"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  GraduationCap, LayoutDashboard, BookOpen, Megaphone, Clock, BarChart3,
  FolderOpen, MessageSquare, Calendar, Package, Bot, CreditCard,
  ClipboardList, Newspaper, HelpCircle, LogOut, Settings, ShieldCheck,
  Zap, X, FileText, Mic, Users, Trophy,
} from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: string;
  isNew?: boolean;
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function NavLink({ href, icon, label, badge, isNew, onClose }: NavItem & { onClose?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClose}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
    >
      <span className={clsx("flex-shrink-0", active ? "text-white" : "text-slate-400")}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {isNew && !badge && (
        <span className="text-[9px] bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 rounded-full px-1.5 py-0.5 font-semibold leading-none uppercase tracking-wide">New</span>
      )}
      {badge && (
        <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">{badge}</span>
      )}
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { t } = useI18n();

  const sidebar = (
    <aside className={clsx(
      "flex flex-col h-full overflow-y-auto",
      "bg-white dark:bg-slate-950 border-e border-slate-200 dark:border-slate-800"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-brand-700 dark:text-brand-400">
          <GraduationCap size={22} />
          <span className="text-base">Tweenz AI</span>
        </Link>
        <button onClick={onClose} className="md:hidden btn-ghost p-1.5" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="App navigation">
        <NavSection title="Overview">
          <NavLink href="/dashboard"     icon={<LayoutDashboard size={18} />} label={t("nav.dashboard")} onClose={onClose} />
          <NavLink href="/courses"       icon={<BookOpen size={18} />}        label={t("nav.courses")} onClose={onClose} />
          <NavLink href="/announcements" icon={<Megaphone size={18} />}       label={t("nav.announcements")} onClose={onClose} />
          <NavLink href="/timeline"      icon={<Clock size={18} />}           label={t("nav.timeline")} onClose={onClose} />
          <NavLink href="/grades"        icon={<BarChart3 size={18} />}       label={t("nav.grades")} onClose={onClose} />
          <NavLink href="/calendar"      icon={<Calendar size={18} />}        label={t("nav.calendar")} onClose={onClose} />
        </NavSection>

        <NavSection title="Study Tools">
          <NavLink href="/files"         icon={<FolderOpen size={18} />}      label={t("nav.files")} onClose={onClose} />
          <NavLink href="/study-packs"   icon={<Package size={18} />}         label={t("nav.study_packs")} onClose={onClose} />
          <NavLink href="/tutor"         icon={<Bot size={18} />}             label={t("nav.tutor")} onClose={onClose} />
          <NavLink href="/flashcards"    icon={<Zap size={18} />}             label={t("nav.flashcards")} onClose={onClose} />
          <NavLink href="/quizzes"       icon={<ClipboardList size={18} />}   label={t("nav.quizzes")} onClose={onClose} />
          <NavLink href="/lecture"       icon={<Mic size={18} />}             label="Lecture Transcription" onClose={onClose} isNew />
        </NavSection>

        <NavSection title="Collaboration">
          <NavLink href="/group-project"   icon={<Users size={18} />}           label="Group Workspace" onClose={onClose} isNew />
          <NavLink href="/messages"      icon={<MessageSquare size={18} />}   label={t("nav.messages")} onClose={onClose} />
        </NavSection>

        <NavSection title="Productivity">
          <NavLink href="/tasks"         icon={<FileText size={18} />}        label={t("nav.tasks")} onClose={onClose} />
          <NavLink href="/weekly-brief"  icon={<Newspaper size={18} />}       label={t("nav.weekly_brief")} onClose={onClose} />
          <NavLink href="/ask-mba"       icon={<HelpCircle size={18} />}      label={t("nav.ask_mba")} onClose={onClose} />
          <NavLink href="/achievements"  icon={<Trophy size={18} />}          label="Achievements" onClose={onClose} isNew />
        </NavSection>

        <NavSection title="Account">
          <NavLink href="/subscription"  icon={<CreditCard size={18} />}      label={t("nav.subscription")} onClose={onClose} />
          <NavLink href="/settings"      icon={<Settings size={18} />}        label={t("nav.settings")} onClose={onClose} />
          <NavLink href="/admin"         icon={<ShieldCheck size={18} />}     label={t("nav.admin")} onClose={onClose} />
        </NavSection>
      </nav>

      {/* Plan indicator */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/30 border border-brand-200 dark:border-brand-800 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Free — All Features Unlocked</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">No subscription required during this phase</p>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex-shrink-0">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <LogOut size={18} />
            {t("nav.signout")}
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col" style={{ width: "var(--sidebar-w)" }}>
        <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
          {sidebar}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative w-72 flex flex-col">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
