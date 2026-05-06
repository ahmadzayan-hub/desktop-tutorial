"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { GraduationCap, X } from "lucide-react";
import type { ReactNode } from "react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="app-main flex flex-col min-h-screen">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />
          {DEMO_MODE && !demoBannerDismissed && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm">
              <GraduationCap className="w-4 h-4 flex-shrink-0" />
              <p className="flex-1">
                <span className="font-semibold">Demo Mode</span>
                {" — "}You're logged in as <span className="font-semibold">Sara Al-Mansouri</span>, MBA Year 2. All data is pre-loaded for testing. Changes won't be saved.
              </p>
              <button onClick={() => setDemoBannerDismissed(true)} className="flex-shrink-0 hover:opacity-70 transition-opacity" aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <main id="main" className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
