import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Tweenz AI — Smart Academic Platform for MBA Students",
  description: "Tweenz AI is the bilingual academic operating system for MBA and university students. AI tutor, study packs, flashcards, grade tracking, deadline management — in English and Arabic.",
  openGraph: {
    title: "Tweenz AI — Your MBA Study Life, Organized by AI",
    description: "The bilingual AI platform for MBA students. Study smarter with AI-generated packs, flashcards, and your personal tutor. Free trial — no card required.",
    url: "/",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Tweenz AI Learning Platform" }],
  },
  alternates: {
    canonical: "/",
    languages: { en: "/", ar: "/" },
  },
};

export default function HomePage() {
  return <HomeClient />;
}
