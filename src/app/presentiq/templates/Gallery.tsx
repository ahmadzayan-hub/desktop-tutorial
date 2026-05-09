"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

type Template = {
  code: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  framework: "SCQA" | "Pyramid" | "RACI" | "OKR" | "PESTEL";
  slides: number;
};

const TEMPLATES: Template[] = [
  { code: "boardroom_decision",   nameEn: "Boardroom Decision",       nameAr: "قرار مجلس الإدارة",      taglineEn: "Recommendation-first deck for executive approvals.", taglineAr: "عرض يبدأ بالتوصية لاعتماد المجلس.", framework: "Pyramid", slides: 12 },
  { code: "scqa_brief",           nameEn: "SCQA Executive Brief",     nameAr: "موجز تنفيذي SCQA",        taglineEn: "Situation, Complication, Question, Answer — McKinsey-style.", taglineAr: "موقف، تعقيد، سؤال، إجابة — على نسق ماكنزي.", framework: "SCQA", slides: 10 },
  { code: "qbr_steering",         nameEn: "QBR Steering",             nameAr: "لجنة توجيه ربعية",        taglineEn: "Quarterly status & decisions for steering committees.", taglineAr: "الحالة الربعية وقرارات التوجيه.", framework: "RACI", slides: 14 },
  { code: "investor_business_case",nameEn: "Investor Business Case",  nameAr: "حالة عمل للمستثمرين",     taglineEn: "Numbers, narrative, ask. Built for board investors.", taglineAr: "الأرقام والسرد والطلب، لمستثمري المجالس.", framework: "Pyramid", slides: 14 },
  { code: "okr_review",           nameEn: "OKR Review",               nameAr: "مراجعة OKR",              taglineEn: "Objectives + key results, with traffic-light scoring.", taglineAr: "الأهداف والنتائج الأساسية بإشارات حالة.", framework: "OKR", slides: 9 },
  { code: "pestel_strategy",      nameEn: "PESTEL Strategy",          nameAr: "استراتيجية PESTEL",       taglineEn: "Macro analysis to guide multi-year strategy.", taglineAr: "تحليل كلّي لتوجيه استراتيجية متعددة السنوات.", framework: "PESTEL", slides: 11 },
  { code: "uae_gov_committee",    nameEn: "UAE Government Committee", nameAr: "لجنة حكومية إماراتية",     taglineEn: "Bilingual EN/AR layout, formal corporate Arabic, mirrored visuals.", taglineAr: "تخطيط ثنائي اللغة، عربية مؤسسية، مخططات معكوسة.", framework: "Pyramid", slides: 12 },
  { code: "training_bilingual",   nameEn: "Training Module",          nameAr: "وحدة تدريبية",            taglineEn: "Learner-friendly bilingual training with bilingual notes.", taglineAr: "تدريب ثنائي اللغة مع ملاحظات للمتدرب.", framework: "SCQA", slides: 16 },
  { code: "tender_response",      nameEn: "Tender Response",          nameAr: "ردّ على عطاء",            taglineEn: "Bid methodology + commercial answer.", taglineAr: "منهجية العرض الفني والإجابة التجارية.", framework: "Pyramid", slides: 18 },
];

const FRAMEWORK_TINT: Record<Template["framework"], string> = {
  Pyramid: "linear-gradient(135deg, rgba(123,142,88,0.18), rgba(66,87,34,0.10))",
  SCQA:    "linear-gradient(135deg, rgba(123,142,88,0.24), rgba(123,142,88,0.06))",
  RACI:    "linear-gradient(135deg, rgba(66,87,34,0.20), rgba(123,142,88,0.05))",
  OKR:     "linear-gradient(135deg, rgba(244,242,233,0.85), rgba(123,142,88,0.12))",
  PESTEL:  "linear-gradient(135deg, rgba(182,139,62,0.22), rgba(66,87,34,0.10))",
};

export function TemplatesGallery() {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
          {t("tpl.title")}
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--pq-text-soft)" }}>{t("tpl.lede")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((tp) => (
          <Frame4D key={tp.code} className="p-0 overflow-hidden">
            <div className="h-32 relative" style={{ background: FRAMEWORK_TINT[tp.framework] }}>
              <div
                className="absolute inset-0 grid place-items-center text-3xl font-semibold tracking-tight"
                style={{ color: "var(--pq-pine)", opacity: 0.18 }}
              >
                {tp.framework}
              </div>
              <span className="pq-pill absolute top-3 start-3" style={{ fontSize: "0.62rem" }}>
                {tp.framework} · {tp.slides} slides
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold" style={{ color: "var(--pq-text)" }}>
                {lang === "ar" ? tp.nameAr : tp.nameEn}
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--pq-text-soft)" }}>
                {lang === "ar" ? tp.taglineAr : tp.taglineEn}
              </p>
              <Link
                href={`/presentiq/projects/new?template=${tp.code}`}
                className="pq-btn pq-btn-secondary mt-4"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {t("tpl.use")}
              </Link>
            </div>
          </Frame4D>
        ))}
      </div>
    </div>
  );
}
