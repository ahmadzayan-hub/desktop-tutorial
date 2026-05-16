import type { Metadata } from "next";
import { Pricing } from "./Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Pitchora pricing — start free, upgrade to Pro at $49/mo, Business at $199/mo, or contact us for Enterprise & Government Private Deployment.",
};

export default function PricingPage() {
  return <Pricing />;
}
