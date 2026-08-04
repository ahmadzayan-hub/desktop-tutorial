"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { FolderKanban, PlusCircle, Settings as SettingsIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/branding/wordmark";
import { LocaleToggle } from "@/components/branding/locale-toggle";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-provider";
import { signOutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: React.ReactNode;
  userEmail: string;
  usingRealAuth: boolean;
}

interface NavItem {
  href: "/projects" | "/new" | "/settings";
  label: string;
  match: string;
  icon: LucideIcon;
}

export function AppShell({ children, userEmail, usingRealAuth }: AppShellProps) {
  const { t, dir } = useLocale();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/projects", label: t.nav.projects, match: "/projects", icon: FolderKanban },
    { href: "/new", label: t.nav.new, match: "/new", icon: PlusCircle },
    { href: "/settings", label: t.nav.settings, match: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50" dir={dir}>
      {/* Top bar. On mobile it stays minimal — the primary nav lives at
          the bottom (thumb-reach) so we can drop the horizontal tab
          strip that used to overflow on narrow phones. */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Wordmark href="/projects" size="sm" />

          {/* Desktop top nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.match);
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "relative inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors",
                      active
                        ? "text-brand-navy"
                        : "text-slate-600 hover:text-brand-navy",
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-0 rounded-md bg-brand-navy/10"
                        transition={{
                          type: "spring",
                          stiffness: 360,
                          damping: 30,
                        }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LocaleToggle />
            <span className="hidden text-xs text-slate-500 md:inline">
              {userEmail}
            </span>
            {usingRealAuth ? (
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="sm">
                  {t.nav.signOut}
                </Button>
              </form>
            ) : (
              <Link href="/">
                <Button variant="secondary" size="sm">
                  {t.nav.signOut}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8",
          // Reserve room for the fixed bottom nav on mobile (nav height
          // 60px + iOS home-indicator safe area).
          "pb-[calc(72px+env(safe-area-inset-bottom))] sm:pb-8",
        )}
      >
        {children}
      </motion.main>

      <footer className="hidden border-t border-slate-200 bg-white sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <p>Mutabasir · {t.footer.version}</p>
          <p>mutabasir.ae</p>
        </div>
      </footer>

      {/* Mobile bottom nav — thumb-reach primary. Fixed, safe-area
          padded, hidden ≥sm. */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={t.nav.projects}
      >
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.match);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                    active
                      ? "text-brand-navy"
                      : "text-slate-500 hover:text-brand-navy",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      active && "scale-110",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate leading-none">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
