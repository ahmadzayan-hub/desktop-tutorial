import type { Metadata } from "next";
import { LandingHeader } from "../_landing/landing-header";
import { LandingFooter } from "../_landing/landing-footer";
import { LegalArticle } from "../_legal/legal-article";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Mutabasir collects, stores, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <LandingHeader />
      <LegalArticle kind="privacy" />
      <LandingFooter />
    </main>
  );
}
