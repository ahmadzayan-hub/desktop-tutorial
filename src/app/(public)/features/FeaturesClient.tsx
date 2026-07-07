"use client";
import { BookOpen, Brain, BarChart3, Bell, Calendar, MessageSquare, Sparkles, Shield, Globe, Zap, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";

const FEATURES: { icon: React.ElementType; color: string; titleKey: DictKey; descKey: DictKey }[] = [
  { icon: Brain,         color: "text-brand-600 bg-brand-50 dark:bg-brand-900/30",   titleKey: "features.aiTutor.title",       descKey: "features.aiTutor.desc"       },
  { icon: BookOpen,      color: "text-teal-600 bg-teal-50 dark:bg-teal-900/30",      titleKey: "features.studyPacks.title",    descKey: "features.studyPacks.desc"    },
  { icon: BarChart3,     color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30", titleKey: "features.grades.title",    descKey: "features.grades.desc"        },
  { icon: Bell,          color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",   titleKey: "features.announcements.title", descKey: "features.announcements.desc" },
  { icon: Calendar,      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30", titleKey: "features.timeline.title",    descKey: "features.timeline.desc"      },
  { icon: Sparkles,      color: "text-rose-600 bg-rose-50 dark:bg-rose-900/30",      titleKey: "features.weeklyBrief.title",   descKey: "features.weeklyBrief.desc"   },
  { icon: FileText,      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30", titleKey: "features.files.title",       descKey: "features.files.desc"         },
  { icon: MessageSquare, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30",      titleKey: "features.askMba.title",        descKey: "features.askMba.desc"        },
  { icon: Globe,         color: "text-green-600 bg-green-50 dark:bg-green-900/30",   titleKey: "features.bilingual.title",     descKey: "features.bilingual.desc"     },
  { icon: Shield,        color: "text-slate-600 bg-slate-100 dark:bg-slate-800",     titleKey: "features.privacy.title",       descKey: "features.privacy.desc"       },
  { icon: Zap,           color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30", titleKey: "features.offline.title",     descKey: "features.offline.desc"       },
  { icon: GraduationCap, color: "text-pink-600 bg-pink-50 dark:bg-pink-900/30",      titleKey: "features.flashcards.title",    descKey: "features.flashcards.desc"    },
];

export default function FeaturesPage() {
  const { t } = useI18n();

  return (
    <main className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 to-teal-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("features.page.title" as DictKey)}</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">{t("features.page.subtitle" as DictKey)}</p>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, titleKey, descKey }) => (
            <div key={titleKey} className="card-hover group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("features.page.cta.heading" as DictKey)}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">{t("features.page.cta.sub" as DictKey)}</p>
        <Link href="/signup" className="btn-primary btn-lg">{t("features.page.cta.btn" as DictKey)}</Link>
      </section>
    </main>
  );
}
