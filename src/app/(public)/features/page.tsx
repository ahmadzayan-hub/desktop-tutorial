import type { Metadata } from "next";
import FeaturesClient from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Features — AI Tutor, Study Packs, Grade Tracker & More",
  description: "Explore all Tweenz AI features: AI tutor with citations, auto-generated flashcards and quizzes, grade tracker, deadline timeline, weekly brief, bilingual English & Arabic interface, and more.",
  openGraph: {
    title: "Tweenz AI Features — Complete Academic AI Platform",
    description: "Every tool MBA and university students need: AI tutor, study packs, flashcards, quizzes, grades, deadlines, and a bilingual interface.",
    url: "/features",
  },
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
