"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
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

export function AppShell({ children, userEmail, usingRealAuth }: AppShellProps) {
  const { t, dir } = useLocale();
  const pathname = usePathname();

  const navItems = [
    { href: "/projects" as const, label: t.nav.projects, match: "/projects" },
    { href: "/new" as const, label: t.nav.new, match: "/new" },
    { href: "/settings" as const, label: t.nav.settings, match: "/settings" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50" dir={dir}>
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Wordmark href="/projects" size="md" />

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

          <div className="flex items-center gap-2">
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

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 sm:hidden">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.match);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "inline-flex h-10 items-center px-3 text-sm font-medium",
                    active
                      ? "border-b-2 border-brand-navy text-brand-navy"
                      : "text-slate-500",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </header>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-6xl flex-1 px-6 py-8"
      >
        {children}
      </motion.main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <p>
            Mutabasir · {t.footer.version}
          </p>
          <p>mutabasir.ae</p>
        </div>
      </footer>
    </div>
  );
}
