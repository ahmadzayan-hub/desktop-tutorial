"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Wordmark } from "@/components/Logo";

export interface NavBadges {
  inbox: number;
  payments: number;
  disputes: number;
  attention: number;
}

interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  group: "Operate" | "Records" | "Insight" | "Admin";
  icon: string;
  badgeKey?: keyof NavBadges;
}

const NAV: NavItem[] = [
  { href: "/",             label: "Dashboard",         labelAr: "لوحة القيادة",  group: "Operate", icon: "■", badgeKey: "attention" },
  { href: "/intake",       label: "New Conversation",  labelAr: "محادثة جديدة",  group: "Operate", icon: "✎" },
  { href: "/inbox",        label: "Customer Inbox",    labelAr: "صندوق العملاء", group: "Operate", icon: "✉", badgeKey: "inbox" },
  { href: "/customers",    label: "Customers",         labelAr: "العملاء",       group: "Records", icon: "♛" },
  { href: "/orders",       label: "Orders",            labelAr: "الطلبات",       group: "Records", icon: "▤" },
  { href: "/payments",     label: "Payments",          labelAr: "المدفوعات",     group: "Records", icon: "₿", badgeKey: "payments" },
  { href: "/couriers",     label: "Couriers",          labelAr: "شركات الشحن",   group: "Records", icon: "↗" },
  { href: "/inventory",    label: "Inventory",         labelAr: "المخزون",        group: "Records", icon: "◫" },
  { href: "/offers",       label: "Offers",            labelAr: "العروض",         group: "Records", icon: "✦" },
  { href: "/suppliers",    label: "Suppliers",         labelAr: "الموردون",       group: "Records", icon: "⊕" },
  { href: "/reports",      label: "Insights",          labelAr: "التحليلات",     group: "Insight", icon: "▥" },
  { href: "/integrations", label: "Integrations",      labelAr: "الربط الخارجي", group: "Admin",   icon: "⇄" },
  { href: "/settings",     label: "Settings",          labelAr: "الإعدادات",     group: "Admin",   icon: "⚙" },
  { href: "/prompts",      label: "Prompt Management", labelAr: "إدارة التعليمات", group: "Admin",  icon: "≡" },
  { href: "/audit",        label: "Audit Log",         labelAr: "سجل التدقيق",   group: "Admin",   icon: "⌖" },
];

const GROUP_LABEL_AR: Record<NavItem["group"], string> = {
  Operate: "العمل اليومي",
  Records: "السجلات",
  Insight: "التحليلات",
  Admin: "الإعدادات",
};

const DEFAULT_BADGES: NavBadges = { inbox: 0, payments: 0, disputes: 0, attention: 0 };

export default function Nav({ mobile, badges = DEFAULT_BADGES }: { mobile?: boolean; badges?: NavBadges }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <div className="rounded-2xl border border-[color:rgb(var(--line))] bg-[color:rgb(var(--surface))] p-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold"
          aria-expanded={open}
          aria-label="Open navigation menu"
        >
          <Wordmark compact />
          <span className="flex items-center gap-2">
            {badges.attention > 0 && (
              <span className="badge badge-vip" aria-label={`${badges.attention} items need attention`}>{badges.attention}</span>
            )}
            <span className="text-[color:rgb(var(--ink-3))]">{open ? "▲" : "▼"}</span>
          </span>
        </button>
        {open && <NavList pathname={pathname} onNav={() => setOpen(false)} badges={badges} />}
      </div>
    );
  }

  return (
    <nav className="flex h-full flex-col gap-5 p-4" aria-label="Primary">
      <Link href="/" className="block px-2" aria-label="Wasl home">
        <Wordmark />
        <div className="mt-1 text-[11px] text-[color:rgb(var(--ink-3))]">Commerce Operating Console</div>
      </Link>
      <NavList pathname={pathname} badges={badges} />
      <div className="mt-auto card-accent text-xs">
        <div className="font-semibold">AI drafts. You approve.</div>
        <div dir="rtl" className="rtl mt-1 font-semibold">الذكاء يكتب؛ أنت توافق.</div>
        <div className="mt-2 opacity-80">
          Every reply is guardrail-checked. Owner approval gates anything that touches money, dispatch, or claims.
        </div>
      </div>
    </nav>
  );
}

function NavList({ pathname, onNav, badges }: { pathname: string; onNav?: () => void; badges: NavBadges }) {
  const groups: NavItem["group"][] = ["Operate", "Records", "Insight", "Admin"];
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g}>
          <div className="nav-group-heading flex items-center justify-between gap-2">
            <span>{g}</span>
            <span dir="rtl" className="rtl text-[color:rgb(var(--ink-3))] opacity-70">{GROUP_LABEL_AR[g]}</span>
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = pathname === n.href;
              const count = n.badgeKey ? badges[n.badgeKey] : 0;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNav}
                  data-active={active}
                  className="nav-link"
                  aria-label={`${n.label} · ${n.labelAr}`}
                >
                  <span className="nav-icon">{n.icon}</span>
                  <span className="flex-1 truncate">{n.label}</span>
                  {count > 0 && (
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        active ? "bg-white/20 text-white" : "bg-[color:rgb(var(--brand-2))] text-[color:rgb(var(--brand-ink))]"
                      )}
                      aria-label={`${count} items`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
