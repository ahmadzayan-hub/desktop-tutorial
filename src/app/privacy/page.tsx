"use client";

import { useT, useI18n } from "@/lib/i18n/I18nProvider";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

export const dynamic = "force-dynamic";

/**
 * Privacy policy page.
 *
 * Plain-language summary of exactly what the platform stores, in both EN
 * and AR. Linked from the footer, the trial banner, and the Settings
 * Privacy row.
 */
export default function PrivacyPage() {
  const t = useT();
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAr ? "سياسة الخصوصية" : "Privacy policy"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isAr
            ? "آخر تحديث: 2 مايو 2026"
            : "Last updated: 2 May 2026"}
        </p>
      </header>

      <div className="card space-y-5 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">{isAr ? "خلاصة في سطر" : "TL;DR"}</h2>
          <p className="mt-1 text-sm">
            {isAr
              ? "كل عملك يبقى في متصفّحك. لا حسابات، لا ملفّات تعريف ارتباط للتتبّع، لا بيع للبيانات. نخزّن فقط الملاحظات المجهولة التي ترسلها بإرادتك."
              : "Your work stays in your browser. No accounts required, no tracking cookies, no data sales. We only store anonymous feedback you choose to send."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            {isAr ? "ما الذي يبقى على جهازك" : "What stays on your device"}
          </h2>
          <ul className="mt-2 list-disc ms-5 text-sm space-y-1.5">
            <li>{isAr
              ? "الموجِّهات التي تكتبها أو تُمليها صوتيًا (في localStorage فقط)."
              : "Prompts you type or dictate (in localStorage only)."}</li>
            <li>{isAr
              ? "تاريخ آخر 20 موجِّه مع شارة النجمة لما تختار حفظه."
              : "Last 20 prompts in your library, with star markers for saved ones."}</li>
            <li>{isAr
              ? "اللهجة الصوتية المختارة، تفضيل المظهر (فاتح/داكن)، حالة المسوّدة."
              : "Voice dialect, theme preference, draft state."}</li>
            <li>{isAr
              ? "الملفّات التي ترفعها (تُقرأ في الذاكرة فقط، لا تُرسَل لأي خادم بدون أمر منك)."
              : "Files you attach (read in memory only, never sent to any server without you triggering a generation)."}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            {isAr ? "ما الذي يصل خادمنا" : "What reaches our server"}
          </h2>
          <ul className="mt-2 list-disc ms-5 text-sm space-y-1.5">
            <li>{isAr
              ? "محتوى الموجِّه عند الضغط على «ابدأ» أو «تحسين سريع» — لتصنيف النيّة وإعادة البناء."
              : "Prompt text when you tap Start or Quick Enhance, so we can classify intent and rebuild it."}</li>
            <li>{isAr
              ? "تقييماتك (إعجاب/عدم إعجاب) إن أرسلتها — مُجمَّعة بدون ربطها بهويتك."
              : "Your ratings (thumbs up/down) when you submit them, aggregated and not tied to your identity."}</li>
            <li>{isAr
              ? "User-Agent مُختصَر (أول 120 حرفًا) لأغراض الجودة فقط."
              : "A truncated User-Agent (first 120 chars) for quality assurance only."}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            {isAr ? "ما الذي لا نفعله أبدًا" : "What we never do"}
          </h2>
          <ul className="mt-2 list-disc ms-5 text-sm space-y-1.5">
            <li>{isAr ? "نبيع بياناتك أو نشاركها مع معلنين." : "Sell your data or share it with advertisers."}</li>
            <li>{isAr ? "نُثبّت ملفّات تعريف ارتباط للتتبّع عبر المواقع." : "Set cross-site tracking cookies."}</li>
            <li>{isAr ? "نسجّل صوتك بعد توقّف الميكروفون." : "Record audio after the microphone stops."}</li>
            <li>{isAr ? "نُرسِل ملفّاتك المرفقة لأطراف ثالثة." : "Send your attached files to third parties."}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            {isAr ? "حقوقك" : "Your rights"}
          </h2>
          <p className="mt-1 text-sm">
            {isAr
              ? "تستطيع في أي وقت: مسح المكتبة المحلّية من زر «مسح» في الإعدادات، حذف المسوّدة الحالية، وتصدير أي موجِّه كملفّ Markdown أو صورة. لا حاجة لطلب ذلك من أحد."
              : "You can at any time: clear your local library from Settings, discard the current draft, and export any prompt as Markdown or PNG. No request needed."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            {isAr ? "تواصل معنا" : "Contact us"}
          </h2>
          <p className="mt-1 text-sm">
            {isAr
              ? "للأسئلة أو طلبات الحذف، راسلنا على"
              : "For questions or deletion requests, email us at"}{" "}
            <a href={CONTACT_MAILTO} className="text-brand-700 dark:text-brand-300 hover:underline break-all">
              {CONTACT_EMAIL}
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            {isAr ? "تحديث السياسة" : "Policy updates"}
          </h2>
          <p className="mt-1 text-sm">
            {isAr
              ? "حين نُحدِّث هذه السياسة سنغيّر تاريخ «آخر تحديث» في الأعلى. لا إشعارات داخل التطبيق ولا بريد ترويجي."
              : "When we update this policy we change the date at the top. No in-app prompts, no marketing email."}
          </p>
        </section>
      </div>

      <footer className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        {isAr
          ? "© 2026 زيان ستوديو. صنع بحبّ في الإمارات 🇦🇪 للعالم."
          : "© 2026 ZAIan Studio. Built with love in the UAE 🇦🇪 for the world."}
      </footer>
    </div>
  );
}
