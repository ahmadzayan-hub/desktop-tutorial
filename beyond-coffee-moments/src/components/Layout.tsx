import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";

/** Public site chrome. Reserves bottom padding so the WhatsApp FAB never
 *  overlaps content, and scrolls to top on route change. */
export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-[60] focus:rounded-full focus:bg-coffee-700 focus:px-4 focus:py-2 focus:text-cream-50"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1 pb-28 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
