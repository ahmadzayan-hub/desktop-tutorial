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
            <span>Beyond Style UAE</span>
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
      <Link href="/" className="block px-2">
        <div className="text-base font-semibold tracking-tight">Beyond Style UAE</div>
        <div className="text-xs text-gray-500">Order Control Console</div>
      </Link>
      <NavList pathname={pathname} badges={badges} />
      <div className="mt-auto rounded-xl border border-pink-200 bg-pink-50 p-3 text-xs text-pink-900">
        <div className="font-semibold">AI drafts. You approve.</div>
        <div className="mt-1 text-pink-900/80">
          Every customer reply is guardrail-checked. Owner approval gates everything that touches
          money, dispatch, or claims.
        </div>
      </div>
    </nav>
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
                    "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5",
                    active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={clsx("w-4 text-center text-xs", active ? "text-gray-300" : "text-gray-400")}>{n.icon}</span>
                    <span>{n.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        active ? "bg-white/20 text-white" : "bg-pink-100 text-pink-800"
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
