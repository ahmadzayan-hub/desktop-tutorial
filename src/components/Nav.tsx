"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

export interface NavBadges {
  inbox: number;
  payments: number;
  disputes: number;
  attention: number;
}

const NAV: { href: string; label: string; group: string; icon: string; badgeKey?: keyof NavBadges }[] = [
  { href: "/",             label: "Dashboard",         group: "Operate", icon: "■", badgeKey: "attention" },
  { href: "/intake",       label: "New Conversation",  group: "Operate", icon: "✎" },
  { href: "/inbox",        label: "Customer Inbox",    group: "Operate", icon: "✉", badgeKey: "inbox" },
  { href: "/customers",    label: "Customers",         group: "Records", icon: "♛" },
  { href: "/orders",       label: "Orders",            group: "Records", icon: "▤" },
  { href: "/payments",     label: "Payments",          group: "Records", icon: "₿", badgeKey: "payments" },
  { href: "/couriers",     label: "Couriers",          group: "Records", icon: "↗" },
  { href: "/inventory",    label: "Inventory",         group: "Records", icon: "◫" },
  { href: "/offers",       label: "Offers",            group: "Records", icon: "✦" },
  { href: "/suppliers",    label: "Suppliers",         group: "Records", icon: "⊕" },
  { href: "/reports",      label: "Insights",          group: "Insight", icon: "▥" },
  { href: "/integrations", label: "Integrations",      group: "Admin",   icon: "⇄" },
  { href: "/settings",     label: "Settings",          group: "Admin",   icon: "⚙" },
  { href: "/prompts",      label: "Prompt Management", group: "Admin",   icon: "≡" },
  { href: "/audit",        label: "Audit Log",         group: "Admin",   icon: "⌖" },
];

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
        >
          <span className="flex items-center gap-2">
            <Wordmark />
            {badges.attention > 0 && (
              <span className="badge badge-vip" aria-label={`${badges.attention} items need attention`}>{badges.attention}</span>
            )}
          </span>
          <span className="text-[color:rgb(var(--ink-3))]">{open ? "▲" : "▼"}</span>
        </button>
        {open && <NavList pathname={pathname} onNav={() => setOpen(false)} badges={badges} />}
      </div>
    );
  }

  return (
    <nav className="flex h-full flex-col gap-5 p-4">
      <Link href="/" className="block px-2">
        <Wordmark />
        <div className="text-[11px] text-[color:rgb(var(--ink-3))]">Order Control Console</div>
      </Link>
      <NavList pathname={pathname} badges={badges} />
      <div className="mt-auto card-accent text-xs">
        <div className="font-semibold">AI drafts. You approve.</div>
        <div className="mt-1 opacity-80">
          Every reply is guardrail-checked. Owner approval gates anything touching money, dispatch, or claims.
        </div>
      </div>
    </nav>
  );
}

function Wordmark() {
  return (
    <span className="inline-flex items-baseline gap-1 text-[15px] font-semibold tracking-tight">
      <span>Beyond Style</span>
      <span className="text-[color:rgb(var(--brand))]">UAE</span>
    </span>
  );
}

function NavList({ pathname, onNav, badges }: { pathname: string; onNav?: () => void; badges: NavBadges }) {
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g}>
          <div className="nav-group-heading">{g}</div>
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
