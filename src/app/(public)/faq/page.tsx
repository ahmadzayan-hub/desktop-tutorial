import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description: "Find answers to the most common questions about Tweenz AI: how to get started, what's included in each plan, data privacy, bilingual support, offline access, and more.",
  openGraph: {
    title: "Tweenz AI FAQ — Common Questions Answered",
    description: "Everything you need to know about Tweenz AI — plans, features, privacy, bilingual support, and how to get started.",
    url: "/faq",
  },
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <FaqClient />;
}
