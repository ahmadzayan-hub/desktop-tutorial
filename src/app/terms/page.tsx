import type { Metadata } from "next";
import { LandingHeader } from "../_landing/landing-header";
import { LandingFooter } from "../_landing/landing-footer";
import { LegalArticle } from "../_legal/legal-article";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for using Mutabasir.",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <LandingHeader />
      <LegalArticle kind="terms" />
      <LandingFooter />
    </main>
  );
}
