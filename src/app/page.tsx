import { LandingHeader } from "./_landing/landing-header";
import { LandingHero } from "./_landing/landing-hero";
import { LandingStats } from "./_landing/landing-stats";
import { LandingProblem } from "./_landing/landing-problem";
import { LandingHow } from "./_landing/landing-how";
import { LandingOutputs } from "./_landing/landing-outputs";
import { LandingFeatures } from "./_landing/landing-features";
import { LandingRules } from "./_landing/landing-rules";
import { LandingPricing } from "./_landing/landing-pricing";
import { LandingFaq } from "./_landing/landing-faq";
import { LandingCta } from "./_landing/landing-cta";
import { LandingFooter } from "./_landing/landing-footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <BackgroundOrbs />
      <LandingHeader />
      <LandingHero />
      <LandingStats />
      <LandingProblem />
      <LandingHow />
      <LandingOutputs />
      <LandingFeatures />
      <LandingRules />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}

function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-brand-navy/10 blur-3xl" />
      <div className="absolute top-[40%] -right-32 h-[560px] w-[560px] rounded-full bg-brand-red/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-brand-gold/10 blur-3xl" />
    </div>
  );
}
