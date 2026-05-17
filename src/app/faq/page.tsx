import type { Metadata } from "next";
import { LandingHeader } from "../_landing/landing-header";
import { LandingFaq } from "../_landing/landing-faq";
import { LandingFooter } from "../_landing/landing-footer";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Mutabasir frequently asked questions.",
};

export default function FaqPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <LandingHeader />
      <div className="pt-10 sm:pt-16">
        <LandingFaq />
      </div>
      <LandingFooter />
    </main>
  );
}
