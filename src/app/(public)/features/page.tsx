"use client";
import { BookOpen, Brain, BarChart3, Bell, Calendar, MessageSquare, Sparkles, Shield, Globe, Zap, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/Motion";

const FEATURES = [
  { icon: Brain,         color: "text-brand-600 bg-brand-100",       title: "AI Tutor that cites your lectures",      desc: "Ask questions about your own course material. Every answer is grounded in the files you uploaded — no hallucinated facts, no generic web content." },
  { icon: BookOpen,      color: "text-teal-600 bg-teal-100",         title: "AI Study Packs",                          desc: "Upload a lecture, get a polished study pack: summary, key takeaways, MBA frameworks, glossary, flashcards, and a quiz — in seconds." },
  { icon: BarChart3,     color: "text-emerald-600 bg-emerald-100",   title: "Grades & GPA Planner",                    desc: "Track weighted coursework, see the exact final-exam score you need, and watch the GPA impact in real time." },
  { icon: Bell,          color: "text-amber-600 bg-amber-100",       title: "Smart Announcements",                     desc: "Paste a screenshot or text from Moodle. AI extracts the deadline, the required action, and the risk level — auto-files it in your timeline." },
  { icon: Calendar,      color: "text-purple-600 bg-purple-100",     title: "Risk-Scored Timeline",                    desc: "Every assignment, quiz, exam, and presentation in one view — colour-coded by how close it is and how prepared you are." },
  { icon: Sparkles,      color: "text-rose-600 bg-rose-100",         title: "Weekly MBA Brief",                        desc: "Every Sunday: a personal academic digest of what's due, where you're at risk, and what to study this week." },
  { icon: FileText,      color: "text-indigo-600 bg-indigo-100",     title: "Private Study Library",                   desc: "Encrypted, per-student file storage. PDFs, slides, audio, video, and notes — all searchable by content, not just filename." },
  { icon: MessageSquare, color: "text-cyan-600 bg-cyan-100",         title: "Ask My MBA Agent",                        desc: "One conversational agent that knows your courses, deadlines, grades, and materials. Answers anything from 'what should I study tonight?' to 'draft a polite reply to my professor.'" },
  { icon: Globe,         color: "text-green-600 bg-green-100",       title: "Bilingual EN ⇄ AR",                       desc: "Full RTL Arabic layout with native UAE wording — not machine translation. Switch languages anywhere; typography adapts." },
  { icon: Shield,        color: "text-slate-600 bg-slate-100",       title: "Privacy by default",                      desc: "Your uploads stay yours. No cross-student data sharing. Export or delete everything at any time." },
  { icon: Zap,           color: "text-yellow-600 bg-yellow-100",     title: "Works offline (PWA)",                     desc: "Install Maktab on your phone, tablet, or laptop. Recent files, flashcards, and notes work without a connection." },
  { icon: GraduationCap, color: "text-pink-600 bg-pink-100",         title: "Flashcards & Quizzes",                    desc: "Generated from your own materials. Spaced-repetition flashcards plus multiple-choice quizzes with explanations." },
];

export default function FeaturesPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-gradient-to-br from-brand-950 to-teal-900 text-white py-20 px-4 text-center overflow-hidden">
        <FadeUp>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">One desk. Everything your MBA needs.</h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Maktab combines a Moodle-style academic workspace with an AI tutor that cites <span className="font-semibold text-white">your own lectures</span> — purpose-built for MBA students, bilingual EN/AR.
          </p>
        </FadeUp>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <StaggerItem key={title} className="card-hover">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-4 text-center">
        <FadeUp>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ready to elevate your MBA?</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">Start your 7-day free trial. No credit card required.</p>
          <Link href="/signup" className="btn-primary btn-lg">Start Free Trial</Link>
        </FadeUp>
      </section>
    </main>
  );
}
