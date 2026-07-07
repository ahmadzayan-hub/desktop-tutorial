import type { Metadata } from "next";
import ForStudentsClient from "./ForStudentsClient";

export const metadata: Metadata = {
  title: "For Students — AI Academic Platform for MBA & University",
  description: "Tweenz AI is built for MBA and university students who want to study smarter. Manage deadlines, get AI-generated study packs, chat with an AI tutor, and track your grades — in English and Arabic.",
  openGraph: {
    title: "Tweenz AI for Students — Study Smarter, Not Harder",
    description: "AI tutor, study packs, deadline tracking, and grade management for MBA and university students. Fully bilingual.",
    url: "/for-students",
  },
  alternates: { canonical: "/for-students" },
};

export default function ForStudentsPage() {
  return <ForStudentsClient />;
}
