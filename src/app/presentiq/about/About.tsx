"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";
import { AuroraWord, Magnetic, Reveal, Tilt } from "@/components/presentiq/ui/motion";
import { PQ_FOUNDER_NAME, PQ_CONTACT_EMAIL } from "@/lib/presentiq/config";

export function About() {
  const { lang } = useI18n();
  const brand = lang === "ar" ? "بِتشورا" : "Pitchora";

  return (
    <div className="space-y-12">
      <Reveal as="header" variant="single">
        <div style={{ textAlign: "center" }}>
          <span className="pq-pill pq-pill-strong">{lang === "ar" ? "من نحن" : "About"}</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--pq-text-main)" }}>
            {lang === "ar" ? "نُسمّي ما نحل: " : "We named what we solve: "}
            <AuroraWord text={brand} start={250} step={lang === "ar" ? 75 : 60} />
          </h1>
          <p className="mt-5 mx-auto max-w-3xl text-base md:text-lg" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.6 }}>
            {lang === "ar"
              ? "بِتشورا = Pitch + Aurora. فعل تقديم الأفكار ممزوجاً بالتحوّل الضوئي من الشرارة الأولى إلى السرد المصقول. اسم واحد يصف المشكلة التي نحلها بدقّة: ردم الفجوة بين فكرة شبه مكتملة وعرض جاهز لمجلس الإدارة."
              : "Pitchora = Pitch + Aurora. The act of pitching ideas, fused with the luminous transformation from spark to polished narrative. One word that names exactly the problem we solve: closing the gap between a half-formed idea and a boardroom-ready deck."}
          </p>
        </div>
      </Reveal>

      <Reveal variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: "◇",
            title: lang === "ar" ? "المشكلة" : "The problem",
            body: lang === "ar"
              ? "الفِرَق التنفيذية تحرق ساعات لتحويل نقاط متفرّقة إلى عرض موحّد ومحوكَم وموثَّق — ثم تعيد الكرّة لكل اجتماع."
              : "Executive teams burn hours turning rough notes into a coherent, governed, evidence-backed deck — then repeat it for every meeting.",
          },
          {
            icon: "▲",
            title: lang === "ar" ? "الحل" : "The solution",
            body: lang === "ar"
              ? "ستوديو وكلاء يستلم الفكرة، يجمع الأدلّة، يصوغ السرد، يطبّق الهوية، يبني الشرائح، ويقيس الجاهزية على ١٠ أبعاد — تلقائياً."
              : "An agent studio that takes the idea, gathers evidence, drafts the narrative, applies the brand, builds the slides, and scores readiness on 10 dimensions — automatically.",
          },
          {
            icon: "◎",
            title: lang === "ar" ? "النتيجة" : "The outcome",
            body: lang === "ar"
              ? "PPTX قابل للتحرير، ثنائي اللغة، محكوم بالهوية، مُقيَّم على ١٠ أبعاد للجاهزية — جاهز للعرض على الرئيس التنفيذي."
              : "An editable PPTX, bilingual, brand-governed, scored on 10 boardroom dimensions — ready for the CEO.",
          },
        ].map((item, i) => (
          <Tilt key={i} max={4}>
            <Frame4D className="p-6 h-full" interactive={false}>
              <div
                className="grid place-items-center w-10 h-10 rounded-xl text-base font-bold mb-3"
                style={{
                  background: "rgba(159,205,99,0.14)",
                  color: "var(--pq-primary)",
                  border: "1px solid rgba(159,205,99,0.32)",
                }}
                aria-hidden
              >
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--pq-text-main)" }}>{item.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.55 }}>{item.body}</p>
            </Frame4D>
          </Tilt>
        ))}
      </Reveal>

      <Reveal variant="single">
        <Frame4D variant="pine" className="p-8 md:p-10" interactive={false}>
          <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: "var(--pq-text-main)" }}>
            {lang === "ar" ? "بُنيت في الإمارات. للمجالس في كل مكان." : "Built in the UAE. For boardrooms everywhere."}
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--pq-text-secondary)", lineHeight: 1.65, maxWidth: "60ch" }}>
            {lang === "ar"
              ? `بنيت بِتشورا من قِبل ${PQ_FOUNDER_NAME} داخل زيان لتلبية احتياج محدّد: عروض تنفيذية ثنائية اللغة (إنجليزي/عربي مع RTL أصلي) بنفس مستوى التألق على الجانبين. كل اجتماع مع مؤسسة استشارية أو لجنة حكومية أو مجلس إدارة كان يكشف نفس المعاناة: نقل النقاط الذهنية إلى عرض مصقول يستهلك ساعات يمكن استرجاعها.`
              : `Pitchora was built by ${PQ_FOUNDER_NAME} inside Zaian to scratch a specific itch: bilingual (English/Arabic with native RTL) executive presentations that look first-class in both directions. Every meeting with a consulting firm, a government committee, or a corporate board surfaced the same pain: turning mental notes into a polished deck devoured hours that should have been spent on the decision itself.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Magnetic as="a" href="/presentiq/projects/new" className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill" style={{ padding: "0.7rem 1.4rem" }}>
              {lang === "ar" ? "جرّب الستوديو" : "Try the studio"} →
            </Magnetic>
            <Magnetic as="a" href={`mailto:${PQ_CONTACT_EMAIL}?subject=Pitchora%20—%20hello`} className="pq-btn pq-btn-liquid pq-btn-liquid-pill" style={{ padding: "0.7rem 1.4rem" }}>
              {lang === "ar" ? "تحدّث مع المؤسس" : "Email the founder"}
            </Magnetic>
          </div>
        </Frame4D>
      </Reveal>

      <Reveal variant="stagger" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { num: "10", label: lang === "ar" ? "أبعاد الجودة" : "Quality dimensions" },
          { num: "EN · AR", label: lang === "ar" ? "ثنائية اللغة" : "Bilingual" },
          { num: "9", label: lang === "ar" ? "قوالب مجلس إدارة" : "Boardroom templates" },
          { num: "PPTX", label: lang === "ar" ? "تصدير قابل للتحرير" : "Editable export" },
        ].map((stat, i) => (
          <Frame4D key={i} className="p-5 text-center" interactive={false}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--pq-primary)", lineHeight: 1.1 }}>{stat.num}</div>
            <div style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--pq-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {stat.label}
            </div>
          </Frame4D>
        ))}
      </Reveal>
    </div>
  );
}
