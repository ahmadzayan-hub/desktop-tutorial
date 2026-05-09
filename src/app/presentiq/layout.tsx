import { ReactNode } from "react";
import Link from "next/link";
import { I18nProvider } from "@/lib/presentiq/i18n/context";
import { ContactBubble } from "@/components/presentiq/ui/ContactBubble";
import { PresentIqShell } from "./_shell";

export const metadata = {
  title: "PresentIQ v0.2 — Boardroom-ready presentations",
  description:
    "AI Agent Platform for corporate presentation generation: brand-compliant, evidence-controlled, editable PPTX, full Arabic-RTL bilingual.",
};

export default function PresentIqLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider initial="en">
      <div data-pq className="min-h-screen">
        <PresentIqShell>{children}</PresentIqShell>
        <ContactBubble />
      </div>
    </I18nProvider>
  );
}
