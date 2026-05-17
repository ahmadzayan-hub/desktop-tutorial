import type { Metadata } from "next";
import { LandingHeader } from "../_landing/landing-header";
import { LandingPricing } from "../_landing/landing-pricing";
import { LandingFaq } from "../_landing/landing-faq";
import { LandingFooter } from "../_landing/landing-footer";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Mutabasir pricing. Start free. Scale when you publish.",
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <LandingHeader />
      <div className="pt-10 sm:pt-16">
        <LandingPricing />
        <LandingFaq />
      </div>
      <LandingFooter />
    </main>
  );
}
