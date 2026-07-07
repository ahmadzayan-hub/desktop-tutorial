import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — Free, Student & Pro Plans",
  description: "Simple, student-friendly pricing. Start free for 7 days. The Student plan gives you unlimited AI tutor chats, study packs, flashcards, and grade tracking. Cancel anytime.",
  openGraph: {
    title: "Tweenz AI Pricing — Plans That Fit Every Student",
    description: "Free plan available. Student plan from $12/month. No hidden fees. 7-day free trial on all paid plans.",
    url: "/pricing",
  },
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingClient />;
}
