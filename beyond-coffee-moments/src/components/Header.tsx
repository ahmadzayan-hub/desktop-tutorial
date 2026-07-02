import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { BrandMark } from "./BrandMark";
import { LanguageToggle } from "./LanguageToggle";

export const NAV_ITEMS = [
  { to: "/", key: "nav.home", end: true },
  { to: "/customize", key: "nav.customize" },
  { to: "/gallery", key: "nav.gallery" },
  { to: "/corporate", key: "nav.corporate" },
  { to: "/pricing", key: "nav.pricing" },
  { to: "/how-it-works", key: "nav.howItWorks" },
  { to: "/delivery", key: "nav.delivery" },
  { to: "/faq", key: "nav.faq" },
  { to: "/contact", key: "nav.contact" },
] as const;

export function Header() {
  const { t, isRtl } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu on navigation + lock body scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-coffee-100/70 bg-cream/85 backdrop-blur-md">
      <div className="container-max flex h-[var(--header-h)] items-center justify-between gap-3">
        <Link to="/" aria-label={t("common.brandName")} className="shrink-0">
          <BrandMark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : undefined}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-coffee-50 text-coffee-900" : "text-coffee-600 hover:bg-coffee-50 hover:text-coffee-900"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <Link to="/customize" className="btn btn-gold btn-sm hidden lg:inline-flex">
            {t("nav.startCustomizing")}
            <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true" />
          </Link>

          {/* Hamburger — mobile & tablet */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            className="grid h-11 w-11 place-items-center rounded-full border border-coffee-100 bg-white text-coffee-700 shadow-sm transition hover:bg-coffee-50 xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <div
        id="mobile-menu"
        className={`xl:hidden ${open ? "block" : "hidden"} border-t border-coffee-100 bg-cream`}
      >
        <nav className="container-max flex flex-col gap-1 py-4" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : undefined}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-base font-medium transition ${
                  isActive ? "bg-coffee-700 text-cream-50" : "text-coffee-700 hover:bg-coffee-50"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <LanguageToggle />
            <Link to="/customize" className="btn btn-gold btn-sm flex-1 justify-center">
              {t("nav.startCustomizing")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
