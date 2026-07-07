import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works — From Setup to AI-Powered Study",
  description: "Learn how Tweenz AI works in 4 steps: add your courses, AI processes your materials, track grades and deadlines, then study smarter with AI-generated packs, flashcards, and your personal tutor.",
  openGraph: {
    title: "How Tweenz AI Works — 4 Steps to Smarter Studying",
    description: "Set up your courses, let AI process your materials, track everything, then study smarter. Start in 2 minutes.",
    url: "/how-it-works",
  },
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
