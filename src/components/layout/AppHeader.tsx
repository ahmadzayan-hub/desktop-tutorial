"use client";
import { Menu, Bell, Sun, Moon, Search, X, BookOpen, Clock, BarChart3, Package, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

interface SearchResult {
  type: string; label: string; href: string; subtitle?: string; icon: React.ReactNode;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  course: <BookOpen className="w-4 h-4 text-brand-500" />,
  deadline: <Clock className="w-4 h-4 text-amber-500" />,
  grade: <BarChart3 className="w-4 h-4 text-emerald-500" />,
  pack: <Package className="w-4 h-4 text-purple-500" />,
  file: <FileText className="w-4 h-4 text-blue-500" />,
};

export function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setShowSearch(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const [cRes, dRes, gRes, pRes, fRes] = await Promise.all([
        fetch("/api/courses"), fetch("/api/deadlines?view=all"),
        fetch("/api/grades"), fetch("/api/study-packs"), fetch("/api/files"),
      ]);
      const [courses, deadlines, grades, packs, files] = await Promise.all([
        cRes.ok ? cRes.json() : [], dRes.ok ? dRes.json() : [],
        gRes.ok ? gRes.json() : [], pRes.ok ? pRes.json() : [], fRes.ok ? fRes.json() : [],
      ]);
      const lower = q.toLowerCase();
      const found: SearchResult[] = [];
      courses.filter((c: any) => c.name?.toLowerCase().includes(lower) || c.code?.toLowerCase().includes(lower)).slice(0, 3).forEach((c: any) =>
        found.push({ type: "course", label: c.name, subtitle: c.code, href: `/courses/${c.id}`, icon: TYPE_ICON.course }));
      deadlines.filter((d: any) => d.title?.toLowerCase().includes(lower) || d.course_name?.toLowerCase().includes(lower)).slice(0, 3).forEach((d: any) =>
        found.push({ type: "deadline", label: d.title, subtitle: d.course_name, href: "/timeline", icon: TYPE_ICON.deadline }));
      grades.filter((g: any) => g.item_name?.toLowerCase().includes(lower) || g.category?.toLowerCase().includes(lower)).slice(0, 2).forEach((g: any) =>
        found.push({ type: "grade", label: g.item_name, subtitle: g.category, href: "/grades", icon: TYPE_ICON.grade }));
      packs.filter((p: any) => p.title?.toLowerCase().includes(lower)).slice(0, 2).forEach((p: any) =>
        found.push({ type: "pack", label: p.title, subtitle: "Study Pack", href: "/study-packs", icon: TYPE_ICON.pack }));
      files.filter((f: any) => f.name?.toLowerCase().includes(lower)).slice(0, 2).forEach((f: any) =>
        found.push({ type: "file", label: f.name, subtitle: "File", href: "/files", icon: TYPE_ICON.file }));
      setResults(found.slice(0, 8));
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQuery(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(q), 300);
  }

  function navigate(href: string) {
    setShowSearch(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tz_theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 sm:px-6 gap-3">
      <button onClick={onMenuClick} className="md:hidden btn-ghost p-2" aria-label="Open menu">
        <Menu size={20} />
      </button>

      {title && (
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">{title}</h1>
      )}

      {/* Search bar */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <button
          onClick={() => { setShowSearch(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="hidden sm:flex w-full items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search courses, deadlines, files…</span>
          <kbd className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>
        <button onClick={() => { setShowSearch(true); setTimeout(() => inputRef.current?.focus(), 50); }} className="sm:hidden btn-ghost p-2">
          <Search size={18} />
        </button>

        {showSearch && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[320px]">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                className="flex-1 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
                placeholder="Search courses, deadlines, grades, files…"
                value={query}
                onChange={handleQuery}
                autoFocus
              />
              {query && (
                <button onClick={() => { setQuery(""); setResults([]); }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600 ml-1">
                <kbd className="text-xs border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5">Esc</kbd>
              </button>
            </div>
            {searching && (
              <div className="px-4 py-3 text-sm text-slate-400">Searching…</div>
            )}
            {!searching && results.length > 0 && (
              <ul className="py-1 max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={() => navigate(r.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <span className="flex-shrink-0">{r.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.label}</p>
                        {r.subtitle && <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>}
                      </div>
                      <span className="ml-auto text-xs text-slate-300 dark:text-slate-600 capitalize flex-shrink-0">{r.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!searching && query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-400">No results for "{query}"</div>
            )}
            {!query && (
              <div className="px-4 py-3 text-xs text-slate-400">
                Quick links: <button onClick={() => navigate("/courses")} className="text-brand-500 hover:underline mr-2">Courses</button>
                <button onClick={() => navigate("/timeline")} className="text-brand-500 hover:underline mr-2">Deadlines</button>
                <button onClick={() => navigate("/grades")} className="text-brand-500 hover:underline">Grades</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => setLocale(locale === "en" ? "ar" : "en")} className="btn-ghost text-xs px-2.5 py-1.5 font-medium" aria-label="Toggle language">
          {t("lang.toggle")}
        </button>
        <button onClick={toggleTheme} className="btn-ghost p-2" aria-label="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn-ghost p-2 relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
