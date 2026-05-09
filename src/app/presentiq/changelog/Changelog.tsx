"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

type Entry = {
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
};

const V0_2_DELTAS: Entry[] = [
  {
    titleEn: "New Pine palette + 4D-frame design system",
    titleAr: "هوية لونية Pine جديدة ونظام إطارات بأبعاد ٤D",
    bodyEn: "Spearmint, Emerald, Teal, Pine — calmer, more boardroom-appropriate. Cards now have multi-layered depth and subtle parallax.",
    bodyAr: "ألوان Spearmint وEmerald وTeal وPine — أكثر هدوءاً وملاءمة لمجالس الإدارة. للبطاقات عمق متعدد الطبقات وحركة هادئة.",
  },
  {
    titleEn: "Bilingual EN/AR with full RTL",
    titleAr: "ثنائية اللغة EN/AR مع دعم RTL كامل",
    bodyEn: "Toggle the platform language from the header. Layout, padding, arrows and text direction all flip correctly.",
    bodyAr: "بدّل لغة المنصة من الترويسة. التخطيط والمسافات والأسهم واتجاه النص تتبدّل بشكل صحيح.",
  },
  {
    titleEn: "Demo mode — no signup required",
    titleAr: "وضع تجربة — دون تسجيل",
    bodyEn: "The trial wizard, dashboard, brand kits, blueprint and slide generation all work without authentication. The previous \"Authentication required\" error is fixed.",
    bodyAr: "معالج التجربة ولوحة التحكم وهويات العلامة وتوليد المخطّط والشرائح تعمل دون تسجيل دخول. تم إصلاح خطأ «المصادقة مطلوبة».",
  },
  {
    titleEn: "Outline editor in the wizard",
    titleAr: "محرّر المخطّط داخل المعالج",
    bodyEn: "Review the AI-proposed slide outline before the deck is generated. Easy way to course-correct the storyline early.",
    bodyAr: "راجع مخطّط الشرائح المقترح من الذكاء قبل توليد العرض. طريقة سريعة لتعديل السرد مبكراً.",
  },
  {
    titleEn: "Templates gallery (SCQA, Pyramid, OKR, PESTEL, UAE Gov)",
    titleAr: "معرض قوالب (SCQA, Pyramid, OKR, PESTEL, حكومي إماراتي)",
    bodyEn: "9 boardroom-grade narrative templates. Each is bilingual and auto-applies the right structure.",
    bodyAr: "٩ قوالب سردية بمستوى مجالس الإدارة، ثنائية اللغة وتُطبَّق بنيتها تلقائياً.",
  },
  {
    titleEn: "Contact + trial-feedback flow",
    titleAr: "تواصل وتجربة وتغذية راجعة",
    bodyEn: "Floating contact bubble + dedicated /contact page. Feedback routes to Ahmad.zaian@outlook.com.",
    bodyAr: "زر تواصل عائم وصفحة مخصصة. ترسل الملاحظات إلى Ahmad.zaian@outlook.com.",
  },
  {
    titleEn: "Removed UAE-RTA-specific copy",
    titleAr: "إزالة المراجع الخاصة بـ«RTA»",
    bodyEn: "PresentIQ is org-agnostic. Government Boardroom and UAE Government Committee templates remain available, without naming a specific authority.",
    bodyAr: "أصبحت PresentIQ محايدة تنظيمياً. تبقى قوالب المجلس الحكومي واللجنة الحكومية الإماراتية متاحة دون تسمية جهة بعينها.",
  },
];

const ROADMAP_NEXT: Entry[] = [
  { titleEn: "Live theme picker", titleAr: "اختيار حيّ للسمة", bodyEn: "Apply a theme and preview it across all slides.", bodyAr: "طبّق سمة وشاهدها على كل الشرائح." },
  { titleEn: "Inline AI image generation", titleAr: "توليد الصور بالذكاء داخل المحرّر", bodyEn: "Generate brand-aligned images per slide.", bodyAr: "ولّد صوراً متوافقة مع الهوية لكل شريحة." },
  { titleEn: "View-only share links", titleAr: "روابط مشاركة للعرض فقط", bodyEn: "Send a link without exposing the editor.", bodyAr: "أرسل رابطاً دون كشف المحرّر." },
  { titleEn: "Version compare with diff view", titleAr: "مقارنة النسخ مع عرض الفروقات", bodyEn: "See exactly what changed between deck versions.", bodyAr: "اعرف ما تغيّر بدقّة بين النسخ." },
  { titleEn: "Live data-bound charts (Supabase / CSV)", titleAr: "مخططات مرتبطة ببيانات حيّة", bodyEn: "Charts refresh from source on open.", bodyAr: "تتحدّث المخططات من المصدر عند الفتح." },
];

export function Changelog() {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-8">
      <header>
        <span className="pq-pill pq-pill-strong">v0.2 · {new Date().toLocaleDateString(lang === "ar" ? "ar-AE" : "en-AE")}</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-pine)" }}>
          {t("v2.title")}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--pq-text-soft)" }}>
          {lang === "ar"
            ? "تجربة أنظف، ودعم عربية رسمية، وحوكمة هوية أقوى، ومنصة أسرع للتجربة."
            : "A cleaner experience, formal Arabic support, stronger brand governance, and a faster path to trial."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {V0_2_DELTAS.map((e) => (
          <Frame4D key={e.titleEn} className="p-5">
            <h3 className="font-semibold" style={{ color: "var(--pq-pine)" }}>
              {lang === "ar" ? e.titleAr : e.titleEn}
            </h3>
            <p className="text-sm mt-2" style={{ color: "var(--pq-text-soft)", lineHeight: 1.55 }}>
              {lang === "ar" ? e.bodyAr : e.bodyEn}
            </p>
          </Frame4D>
        ))}
      </div>

      <Frame4D variant="pine" className="p-8" interactive={false}>
        <h2 className="text-xl font-semibold" style={{ color: "var(--pq-spearmint)" }}>
          {lang === "ar" ? "ما يلي بعد ذلك" : "Coming next"}
        </h2>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {ROADMAP_NEXT.map((e) => (
            <li key={e.titleEn} className="text-sm" style={{ color: "var(--pq-spearmint)", opacity: 0.92 }}>
              <strong>{lang === "ar" ? e.titleAr : e.titleEn}</strong>{" "}
              <span style={{ opacity: 0.78 }}>— {lang === "ar" ? e.bodyAr : e.bodyEn}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/presentiq/contact"
          className="pq-btn mt-6"
          style={{ background: "var(--pq-spearmint)", color: "var(--pq-pine)" }}
        >
          {t("land.cta.contact")} →
        </Link>
      </Frame4D>
    </div>
  );
}
