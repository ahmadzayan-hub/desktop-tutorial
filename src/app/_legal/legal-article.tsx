"use client";

import { useLocale } from "@/lib/i18n/locale-provider";

const UPDATED = "17 May 2026";

const PRIVACY_EN = [
  {
    h: "1. What this policy covers",
    p: "This Privacy Policy describes how Mutabasir collects, uses, stores and shares information when you use the platform at mutabasir.ae and the Basira AI engine that powers it.",
  },
  {
    h: "2. Data we collect",
    p: "Account data (name, email), workspace data (project metadata, source documents you upload, briefs you write, dashboards you publish), and operational data (audit logs, error reports, anonymous usage metrics).",
  },
  {
    h: "3. How we use it",
    p: "We process your documents only to produce the dashboards you request. We never use customer documents to train shared models. Anthropic processes prompts under their enterprise zero-retention terms; documents are not retained beyond the request lifecycle.",
  },
  {
    h: "4. Where data is stored",
    p: "Production data is stored in managed Postgres with row-level security and at-rest encryption. Customers in the UAE are served from the AWS Middle East (UAE) region.",
  },
  {
    h: "5. Sharing",
    p: "We do not sell your data. We share data only with sub-processors strictly required to deliver the service (Supabase for database, Vercel for hosting, Anthropic for AI inference, Resend for transactional email).",
  },
  {
    h: "6. Your rights",
    p: "You can export, edit or delete your account data at any time. Enterprise customers may request a deletion certificate and audit-log export. Contact privacy@mutabasir.ae.",
  },
  {
    h: "7. Contact",
    p: "Beyond Connect General Trading L.L.C, Dubai, UAE. privacy@mutabasir.ae",
  },
];

const PRIVACY_AR = [
  {
    h: "١. نطاق هذه السياسة",
    p: "تشرح هذه السياسة كيف يجمع متابصير المعلومات ويستخدمها ويحفظها ويشاركها عند استخدامك المنصة على mutabasir.ae ومحرّك بصيرة المُشغِّل لها.",
  },
  {
    h: "٢. البيانات التي نجمعها",
    p: "بيانات الحساب (الاسم، البريد الإلكتروني)، وبيانات مساحة العمل (بيانات المشاريع، المستندات المرفوعة، الموجزات، اللوحات المنشورة)، وبيانات تشغيلية (سجلات المراجعة، تقارير الأخطاء، مقاييس استخدام مجهولة الهوية).",
  },
  {
    h: "٣. كيف نستخدمها",
    p: "نُعالج مستنداتك فقط لإنتاج اللوحات التي تطلبها. لا نستخدم مستندات العملاء لتدريب نماذج مشتركة أبداً. تُعالَج المدخلات وفق شروط Anthropic للمؤسّسات بصفرية الاحتفاظ، ولا تُخزَّن المستندات بعد دورة الطلب.",
  },
  {
    h: "٤. أين تُحفظ البيانات",
    p: "تُحفظ بيانات الإنتاج في Postgres مُدارة بأمان مستوى الصف وتشفير في الراحة. يُخدَّم العملاء داخل الإمارات من منطقة AWS الشرق الأوسط.",
  },
  {
    h: "٥. المشاركة",
    p: "لا نبيع بياناتك. نشاركها فقط مع المعالجين الفرعيين اللازمين لتقديم الخدمة (Supabase لقاعدة البيانات، Vercel للاستضافة، Anthropic للذكاء، Resend للبريد).",
  },
  {
    h: "٦. حقوقك",
    p: "يحقّ لك تصدير بياناتك وتعديلها وحذفها في أي وقت. لعملاء المؤسّسات شهادة حذف وتصدير سجل المراجعة عند الطلب. للتواصل: privacy@mutabasir.ae.",
  },
  {
    h: "٧. التواصل",
    p: "شركة بيوند كونكت للتجارة العامة ذ.م.م، دبي، الإمارات. privacy@mutabasir.ae",
  },
];

const TERMS_EN = [
  {
    h: "1. Acceptance",
    p: "By creating an account you accept these Terms of Service. If you do not agree, do not use the platform.",
  },
  {
    h: "2. Permitted use",
    p: "Mutabasir is licensed for use by your organisation to convert your own documents into dashboards. You will not upload content you are not authorised to process.",
  },
  {
    h: "3. Accuracy",
    p: "Basira produces best-effort extractions with explicit confidence levels and source citations. Every fact must be human-verified before official use. Mutabasir is a decision-support tool, not a decision-maker.",
  },
  {
    h: "4. Confidentiality",
    p: "Your documents are confidential. We will not view, share or use them for any purpose other than delivering the service you requested.",
  },
  {
    h: "5. Subscription and fees",
    p: "Paid plans are billed monthly or annually. You may cancel at any time; service continues until the end of the billing period.",
  },
  {
    h: "6. Termination",
    p: "We may suspend or terminate accounts that breach these terms. You may delete your account at any time.",
  },
  {
    h: "7. Liability",
    p: "To the maximum extent permitted by UAE law, Mutabasir's liability for any claim is limited to fees paid in the 12 months preceding the claim.",
  },
  {
    h: "8. Governing law",
    p: "These terms are governed by the laws of the United Arab Emirates. Disputes are resolved in the courts of Dubai.",
  },
];

const TERMS_AR = [
  {
    h: "١. القبول",
    p: "بإنشائك حساباً فإنك توافق على هذه الشروط. إن لم تكن موافقاً، فلا تستخدم المنصة.",
  },
  {
    h: "٢. الاستخدام المسموح به",
    p: "يُرخَّص متابصير لاستخدام مؤسّستك في تحويل مستنداتك إلى لوحات. لن ترفع محتوى لست مخوَّلاً بمعالجته.",
  },
  {
    h: "٣. الدقّة",
    p: "تُقدِّم بصيرة استخراجات بأقصى جهد مع درجات ثقة صريحة واستشهاد بالمصادر. كل واقعة يجب أن تُراجَع بشرياً قبل الاستخدام الرسمي. متابصير أداة دعم قرار، لا صانع قرار.",
  },
  {
    h: "٤. السرّية",
    p: "مستنداتك سرّية. لن نطّلع عليها أو نشاركها أو نستخدمها لأي غرض غير تقديم الخدمة التي طلبتها.",
  },
  {
    h: "٥. الاشتراك والرسوم",
    p: "تُحتسب الباقات المدفوعة شهرياً أو سنوياً. يمكنك الإلغاء في أي وقت، وتستمر الخدمة حتى نهاية دورة الفوترة.",
  },
  {
    h: "٦. الإنهاء",
    p: "يحقّ لنا تعليق الحسابات أو إنهاؤها عند مخالفة الشروط. ويحقّ لك حذف حسابك في أي وقت.",
  },
  {
    h: "٧. المسؤولية",
    p: "إلى أقصى ما يسمح به القانون الإماراتي، تقتصر مسؤولية متابصير عن أي مطالبة على الرسوم المدفوعة خلال الإثني عشر شهراً السابقة للمطالبة.",
  },
  {
    h: "٨. القانون الحاكم",
    p: "تُحكم هذه الشروط بقوانين دولة الإمارات العربية المتحدة. وتُحلّ النزاعات أمام محاكم دبي.",
  },
];

export function LegalArticle({ kind }: { kind: "privacy" | "terms" }) {
  const { t, dir, locale } = useLocale();
  const meta = t.legal[kind];
  const sections =
    kind === "privacy"
      ? locale === "ar"
        ? PRIVACY_AR
        : PRIVACY_EN
      : locale === "ar"
        ? TERMS_AR
        : TERMS_EN;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16" dir={dir}>
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
          {kind === "privacy" ? t.nav.privacy : t.nav.terms}
        </p>
        <h1 className="display-tight mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {meta.updated}: {UPDATED}
        </p>
      </header>
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="display-tight text-base font-semibold text-brand-navy sm:text-lg">
              {s.h}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              {s.p}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
