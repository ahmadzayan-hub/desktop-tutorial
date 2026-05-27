"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV: { href: string; label: string; group: string }[] = [
  { href: "/", label: "Dashboard", group: "Operate" },
  { href: "/intake", label: "New Conversation", group: "Operate" },
  { href: "/inbox", label: "Customer Inbox", group: "Operate" },
  { href: "/customers", label: "Customers", group: "Records" },
  { href: "/orders", label: "Orders", group: "Records" },
  { href: "/inventory", label: "Inventory", group: "Records" },
  { href: "/offers", label: "Offers", group: "Records" },
  { href: "/payments", label: "Payments", group: "Records" },
  { href: "/couriers", label: "Courier Tracking", group: "Records" },
  { href: "/suppliers", label: "Suppliers", group: "Records" },
  { href: "/reviews", label: "Reviews", group: "Records" },
  { href: "/reports", label: "Reports & Reviews", group: "Insight" },
  { href: "/settings", label: "Settings", group: "Admin" },
  { href: "/prompts", label: "Prompt Management", group: "Admin" },
  { href: "/audit", label: "Audit Log", group: "Admin" },
];

export default function Nav() {
  const pathname = usePathname();
  const groups = Array.from(new Set(NAV.map((n) => n.group)));
  return (
    <nav className="flex flex-col gap-4 p-4 text-sm">
      <div className="px-2">
        <div className="text-base font-semibold">Beyond Style UAE</div>
        <div className="text-xs text-gray-500">Order Control Console</div>
      </div>
      {groups.map((g) => (
        <div key={g}>
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {g}
          </div>
          <div className="flex flex-col">
            {NAV.filter((n) => n.group === g).map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={clsx(
                    "rounded-lg px-2 py-1.5",
                    active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
