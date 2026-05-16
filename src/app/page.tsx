import { LandingHeader } from "./_landing/landing-header";
import { LandingHero } from "./_landing/landing-hero";
import { LandingProblem } from "./_landing/landing-problem";
import { LandingHow } from "./_landing/landing-how";
import { LandingOutputs } from "./_landing/landing-outputs";
import { LandingRules } from "./_landing/landing-rules";
import { LandingCta } from "./_landing/landing-cta";
import { LandingFooter } from "./_landing/landing-footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50">
      <BackgroundOrbs />
      <LandingHeader />
      <LandingHero />
      <LandingProblem />
      <LandingHow />
      <LandingOutputs />
      <LandingRules />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}

function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-rta-navy/10 blur-3xl" />
      <div className="absolute top-[40%] -right-32 h-[560px] w-[560px] rounded-full bg-rta-red/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-rta-gold/10 blur-3xl" />
    </div>
  );
}
