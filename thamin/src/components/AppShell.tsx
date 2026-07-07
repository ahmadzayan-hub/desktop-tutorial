import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getDict, getLocale } from '@/lib/i18n';
import { LangSwitch, LogoutButton } from './HeaderActions';
import { LogoLockup } from './Logo';

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-gold text-black',
  MANAGER: 'bg-gold/25 text-gold',
  SALES: 'bg-white/10 text-white',
  VIEWER: 'bg-white/10 text-white/60',
};

export default function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();

  const nav = [
    { href: '/', label: t.home, icon: '⌂' },
    { href: '/calculator', label: t.calculatePrice, icon: '🧮' },
    { href: '/quotes', label: t.quotes, icon: '🧾' },
    { href: '/products', label: t.products, icon: '💍' },
    { href: '/dashboard', label: t.dashboard, icon: '📊' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b-2 border-gold/50 bg-ink text-white no-print">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" aria-label={t.appName}>
            <LogoLockup ar={locale === 'ar'} compact />
          </Link>
          <div className="flex items-center gap-2">
            {session && (
              <span className={`badge ${roleBadge[session.role] ?? ''}`}>{session.role}</span>
            )}
            <LangSwitch current={locale} />
            {session && <LogoutButton label={t.logout} />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        {title && <h1 className="mb-4 text-xl font-bold tracking-tight">{title}</h1>}
        {children}
      </main>

      {/* mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white md:hidden no-print" aria-label="Main">
        <div className="mx-auto grid max-w-5xl grid-cols-5">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-neutral-600 hover:text-gold-dark">
              <span className="text-lg leading-none" aria-hidden="true">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
