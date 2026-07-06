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
  { href: "/", label: "Dashboard", group: "Operate", icon: "■", badgeKey: "attention" },
  { href: "/intake", label: "New Conversation", group: "Operate", icon: "✎" },
  { href: "/inbox", label: "Customer Inbox", group: "Operate", icon: "✉", badgeKey: "inbox" },
  { href: "/customers", label: "Customers", group: "Records", icon: "♛" },
  { href: "/orders", label: "Orders", group: "Records", icon: "▤" },
  { href: "/payments", label: "Payments", group: "Records", icon: "₿", badgeKey: "payments" },
  { href: "/couriers", label: "Couriers & Delivery", group: "Records", icon: "↗" },
  { href: "/inventory", label: "Inventory", group: "Records", icon: "◫" },
  { href: "/offers", label: "Offers", group: "Records", icon: "✦" },
  { href: "/suppliers", label: "Suppliers", group: "Records", icon: "⊕" },
  { href: "/reviews", label: "Reviews", group: "Records", icon: "★" },
  { href: "/reports", label: "Reports & Reviews", group: "Insight", icon: "▥" },
  { href: "/integrations", label: "Integrations", group: "Admin", icon: "⇄" },
  { href: "/settings", label: "Settings", group: "Admin", icon: "⚙" },
  { href: "/prompts", label: "Prompt Management", group: "Admin", icon: "≡" },
  { href: "/audit", label: "Audit Log", group: "Admin", icon: "⌖" },
];

const DEFAULT_BADGES: NavBadges = { inbox: 0, payments: 0, disputes: 0, attention: 0 };

export default function Nav({ mobile, badges = DEFAULT_BADGES }: { mobile?: boolean; badges?: NavBadges }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <BrandMark />
            {badges.attention > 0 && (
              <span className="badge badge-vip" aria-label={`${badges.attention} items need attention`}>{badges.attention}</span>
            )}
          </span>
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </button>
        {open && <NavList pathname={pathname} onNav={() => setOpen(false)} badges={badges} />}
      </div>
    );
  }

  return (
    <nav className="flex h-full flex-col gap-4 p-4 text-sm">
      <Link href="/" className="block px-2 group">
        <BrandMark large />
        <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          Order Control Console
        </div>
      </Link>
      <NavList pathname={pathname} badges={badges} />
      <div className="mt-auto card-accent text-xs">
        <div className="font-semibold text-ink" style={{ color: "rgb(var(--ink))" }}>
          AI drafts. You approve.
        </div>
        <div className="mt-1 text-gray-700">
          Every reply passes the guardrail engine. Owner approval gates anything that touches money,
          dispatch, or product claims.
        </div>
      </div>
    </nav>
  );
}

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={clsx(
          "grid place-items-center rounded-full text-ink font-semibold",
          large ? "h-8 w-8 text-sm" : "h-6 w-6 text-[11px]",
        )}
        style={{
          background: "linear-gradient(135deg, rgb(var(--brand-dark)), rgb(var(--brand)) 55%, rgb(var(--brand-light)))",
          color: "rgb(var(--ink))",
        }}
        aria-hidden
      >
        B
      </span>
      <span className={clsx("display-face tracking-tight", large ? "text-[17px]" : "text-sm")}>
        Beyond Style <span className="text-gray-500">UAE</span>
      </span>
    </span>
  );
}

function NavList({ pathname, onNav, badges }: { pathname: string; onNav?: () => void; badges: NavBadges }) {
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g}>
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{g}</div>
          <div className="flex flex-col">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = pathname === n.href;
              const count = n.badgeKey ? badges[n.badgeKey] : 0;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNav}
                  className={clsx(
                    "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors",
                    active
                      ? "text-cream"
                      : "text-gray-700 hover:bg-cream/60",
                  )}
                  style={active ? { background: "rgb(var(--ink))", color: "rgb(var(--cream))" } : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={clsx("w-4 text-center text-xs")}
                      style={active ? { color: "rgb(var(--brand))" } : { color: "rgb(156 163 175)" }}
                    >
                      {n.icon}
                    </span>
                    <span>{n.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-semibold")}
                      style={
                        active
                          ? { background: "rgb(var(--brand))", color: "rgb(var(--ink))" }
                          : { background: "rgb(var(--brand-light) / 0.6)", color: "rgb(var(--brand-dark))" }
                      }
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
