"use client";
import Link from "next/link";
import { Clock, Target, BookOpen, Globe } from "lucide-react";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/Motion";

const features = [
  { icon: Clock,    title: "Always know what's due",            desc: "The Timeline Agent tracks every deadline with risk scoring. Never miss a submission again. Get a daily focus recommendation every morning." },
  { icon: Target,   title: "Focus on what matters",             desc: "The weekly AI brief answers 'What should I focus on today?' · synthesizing grades, deadlines, announcements, and professor signals." },
  { icon: BookOpen, title: "Study materials that talk back",    desc: "Upload your slides and the AI tutor can answer questions about them with citations. Generate flashcards and quizzes automatically." },
  { icon: Globe,    title: "Fully bilingual · English & Arabic", desc: "Switch between English and Arabic at any time. The interface adapts to RTL layout automatically for Arabic. IBM Plex Sans Arabic font included." },
];

export default function ForStudentsPage() {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="bg-gradient-to-br from-navy-900 to-brand-900 text-white py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <div className="badge bg-white/20 text-white mb-6 text-sm">For MBA Students</div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Your MBA Journey, Powered by AI</h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Stop drowning in Moodle, spreadsheets, and scattered notes. Maktab brings every part of your MBA onto one bilingual desk · مكتب واحد.
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-slate-50 px-8 py-4 text-base font-semibold inline-flex">
              Start Free · No Card Required
            </Link>
          </FadeUp>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeUp>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Built for how MBA students actually study</h2>
        </FadeUp>
        <Stagger className="grid md:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title} className="flex gap-4">
              <div className="p-3 bg-brand-100 dark:bg-brand-900/50 rounded-xl h-fit">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-4 text-center">
        <FadeUp>
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Simple, student-friendly pricing</h2>
          <p className="text-slate-500 mb-8">7-day free trial on all plans. Cancel anytime.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/pricing" className="btn-secondary btn-lg">View Pricing</Link>
            <Link href="/signup" className="btn-primary btn-lg">Start Free Trial</Link>
          </div>
        </FadeUp>
      </section>
    </main>
  );
}
