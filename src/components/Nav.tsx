"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const NAV: { href: string; label: string; group: string; icon: string }[] = [
  { href: "/", label: "Dashboard", group: "Operate", icon: "■" },
  { href: "/intake", label: "New Conversation", group: "Operate", icon: "✎" },
  { href: "/inbox", label: "Customer Inbox", group: "Operate", icon: "✉" },
  { href: "/customers", label: "Customers", group: "Records", icon: "♛" },
  { href: "/orders", label: "Orders", group: "Records", icon: "▤" },
  { href: "/payments", label: "Payments", group: "Records", icon: "₿" },
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

export default function Nav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-sm font-semibold"
        >
          <span>Beyond Style UAE</span>
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </button>
        {open && <NavList pathname={pathname} onNav={() => setOpen(false)} />}
      </div>
    );
  }

  return (
    <nav className="flex h-full flex-col gap-4 p-4 text-sm">
      <Link href="/" className="block px-2">
        <div className="text-base font-semibold tracking-tight">Beyond Style UAE</div>
        <div className="text-xs text-gray-500">Order Control Console</div>
      </Link>
      <NavList pathname={pathname} />
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

function NavList({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g}>
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{g}</div>
          <div className="flex flex-col">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={onNav}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5",
                    active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="w-4 text-center text-xs text-gray-400">{n.icon}</span>
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
