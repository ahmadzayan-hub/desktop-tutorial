"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { LayoutDashboard, BookOpen, Brain, CalendarCheck, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

const BOTTOM_NAV = [
  { href: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Today"    },
  { href: "/courses",   icon: <BookOpen size={20} />,        label: "Courses"  },
  { href: "/study",     icon: <Brain size={20} />,           label: "Study"    },
  { href: "/plan",      icon: <CalendarCheck size={20} />,   label: "Plan"     },
  { href: "/progress",  icon: <TrendingUp size={20} />,      label: "Progress" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  return (
    <ToastProvider>
      {/* Animated background mesh */}
      <div className="bg-mesh" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      <div className="app-layout relative z-10">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="app-main">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />
          <main
            id="main"
            className={`flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <div className="animate-fade-up">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/20 dark:border-white/5"
        style={{ background: "rgba(248,250,252,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-stretch h-16 px-2">
          {BOTTOM_NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl mx-0.5 my-1.5 transition-all text-[10px] font-semibold tracking-tight ${
                  active
                    ? "bg-brand-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className={`transition-transform ${active ? "scale-110" : ""}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </ToastProvider>
  );
}
