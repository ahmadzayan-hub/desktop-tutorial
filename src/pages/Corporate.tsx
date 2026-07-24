import { useRef, useState } from "react";
import {
  Sparkles, Gift, CalendarHeart, Presentation, Check, Upload,
  Download, MessageCircle, ArrowLeft, Wand2,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";
import { Section, SectionHeader } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { EVENT_PACKAGES } from "@/lib/catalog";
import { formatAed } from "@/lib/format";
import { BRAND, sellerValueSet } from "@/lib/brand";
import { waLink } from "@/lib/whatsapp";
import { makeRef } from "@/lib/id";
import { recommendEventPackage } from "@/lib/ai";
import { buildQuotation, type Quotation } from "@/lib/quotation";

interface CorpForm {
  company: string;
  contact: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  guests: number;
  branding: string;
  packageId: string;
  logo: string | null;
}

const INITIAL: CorpForm = {
  company: "", contact: "", phone: "", email: "", eventType: "activation",
  eventDate: "", location: "", guests: 150, branding: "", packageId: "", logo: null,
};

const USE_CASES = [
  { key: "activation", Icon: Sparkles },
  { key: "staff", Icon: Gift },
  { key: "wedding", Icon: CalendarHeart },
  { key: "conference", Icon: Presentation },
];

export default function Corporate() {
  const { t, lang, pick } = useI18n();
  const [form, setForm] = useState<CorpForm>(INITIAL);
  const [quote, setQuote] = useState<(Quotation & { form: CorpForm }) | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<CorpForm>) => setForm((f) => ({ ...f, ...patch }));

  function recommend() {
    const pkg = recommendEventPackage(form.guests);
    set({ packageId: pkg.id });
    setRecommendation(
      t("corporate.recommender.result", {
        guests: form.guests,
        type: t(`corporate.form.eventTypes.${form.eventType}`),
        pkg: pick(pkg.name),
      }),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pkg = EVENT_PACKAGES.find((p) => p.id === form.packageId) ?? recommendEventPackage(form.guests);
    setQuote({ ...buildQuotation(makeRef("QT"), pkg, form.guests), form });
    window.scrollTo({ top: 0 });
  }

  if (quote) return <QuotationView quote={quote} onEdit={() => setQuote(null)} />;

  return (
    <>
      <Seo title={t("corporate.title")} description={t("corporate.subtitle")} />

      {/* Intro */}
      <Section>
        <SectionHeader eyebrow={t("nav.corporate")} title={t("corporate.title")} subtitle={t("corporate.subtitle")} />

        {/* Use cases */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u, i) => (
            <Reveal key={u.key} delay={i * 70}>
              <div className="h-full rounded-2xl border border-coffee-100/70 bg-white p-6 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-500/10">
                  <u.Icon className="h-5 w-5 text-gold-600" />
                </span>
                <h3 className="mt-3 font-semibold text-coffee-900">{t(`corporate.useCases.${u.key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-coffee-600">{t(`corporate.useCases.${u.key}.desc`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Packages */}
      <Section muted>
        <SectionHeader title={t("corporate.packagesHeading")} subtitle={t("corporate.packagesSub")} />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {EVENT_PACKAGES.map((p) => (
            <div key={p.id} className={`flex flex-col rounded-2xl border bg-white p-6 shadow-soft ${p.tag ? "border-coffee-700" : "border-coffee-100/70"}`}>
              <h3 className="font-serif text-xl font-bold text-coffee-900">{pick(p.name)}</h3>
              <p className="mt-2 font-serif text-3xl font-bold text-coffee-700">{formatAed(p.price, lang)}</p>
              <p className="text-xs text-coffee-400">{t("corporate.perEvent")} · +VAT · {p.cups} {t("corporate.cupsIncluded")}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-coffee-600">
                {p.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />{pick(inc)}</li>
                ))}
              </ul>
              <button type="button" className="btn btn-outline mt-5 w-full justify-center" onClick={() => { set({ packageId: p.id }); document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" }); }}>
                {t("corporate.quoteHeading")}
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Quotation request form */}
      <Section>
        <div id="quote" className="mx-auto max-w-3xl scroll-mt-24">
          <SectionHeader title={t("corporate.quoteHeading")} subtitle={t("corporate.quoteSub")} />
          <form onSubmit={submit} className="mt-8 rounded-3xl border border-coffee-100/70 bg-white p-6 shadow-soft sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("corporate.form.company")} required><input required className="field" value={form.company} onChange={(e) => set({ company: e.target.value })} /></Field>
              <Field label={t("corporate.form.contact")} required><input required className="field" value={form.contact} onChange={(e) => set({ contact: e.target.value })} /></Field>
              <Field label={t("corporate.form.phone")} required><input required inputMode="tel" className="field" placeholder="+971 5X XXX XXXX" value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
              <Field label={t("corporate.form.email")} required><input required type="email" className="field" value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
              <Field label={t("corporate.form.eventType")}>
                <select className="field" value={form.eventType} onChange={(e) => set({ eventType: e.target.value })}>
                  {["activation", "staff", "wedding", "conference", "other"].map((k) => (
                    <option key={k} value={k}>{t(`corporate.form.eventTypes.${k}`)}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("corporate.form.eventDate")}><input type="date" className="field" value={form.eventDate} onChange={(e) => set({ eventDate: e.target.value })} /></Field>
              <Field label={t("corporate.form.location")}><input className="field" value={form.location} onChange={(e) => set({ location: e.target.value })} /></Field>
              <Field label={t("corporate.form.guests")}>
                <input type="number" min={10} className="field" value={form.guests} onChange={(e) => set({ guests: Number(e.target.value) || 0 })} />
              </Field>
            </div>

            <div className="mt-4">
              <Field label={t("corporate.form.branding")}>
                <textarea rows={3} className="field resize-none" placeholder={t("corporate.form.brandingPlaceholder")} value={form.branding} onChange={(e) => set({ branding: e.target.value })} />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="field-label">{t("corporate.form.logo")}</span>
                <button type="button" onClick={() => logoRef.current?.click()} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-coffee-200 bg-cream-50 px-4 py-3 text-sm text-coffee-600 hover:border-gold-500">
                  <Upload className="h-4 w-4" /> {form.logo ? "✓ " + t("corporate.form.logo") : t("corporate.form.logoHint")}
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="sr-only" aria-label={t("corporate.form.logo")} onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) set({ logo: URL.createObjectURL(f) });
                }} />
              </div>
              <div>
                <span className="field-label">{t("corporate.form.package")}</span>
                <select className="field" value={form.packageId} onChange={(e) => set({ packageId: e.target.value })}>
                  <option value="">-</option>
                  {EVENT_PACKAGES.map((p) => <option key={p.id} value={p.id}>{pick(p.name)}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gold-500/5 p-4">
              <button type="button" className="btn btn-outline btn-sm" onClick={recommend}>
                <Wand2 className="h-4 w-4" /> {t("corporate.form.recommend")}
              </button>
              {recommendation && <p className="mt-2 text-sm font-medium text-coffee-700">{recommendation}</p>}
            </div>

            <p className="mt-4 text-xs text-coffee-400">{t("corporate.form.privacy")}</p>
            <button type="submit" className="btn btn-primary mt-4 w-full justify-center">{t("corporate.form.submit")}</button>
          </form>
        </div>
      </Section>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

/* --------------------------- Quotation output --------------------------- */
function QuotationView({ quote, onEdit }: { quote: Quotation & { form: CorpForm }; onEdit: () => void }) {
  const { t, lang, pick } = useI18n();
  const f = quote.form;

  const waSummary =
    `${t("corporate.quote.title")} ${quote.ref}\n${f.company} · ${t(`corporate.form.eventTypes.${f.eventType}`)}\n` +
    `${pick(quote.pkg.name)} · ${f.guests} ${t("corporate.form.guests")}\n${t("corporate.quote.total")}: ${formatAed(quote.total, lang)}`;

  return (
    <div className="container-max max-w-3xl py-10">
      <Seo title={t("corporate.quote.title")} />

      {/* Ready banner (not printed) */}
      <div className="no-print mb-6 rounded-2xl border border-gold-500/30 bg-cream-50 p-5">
        <h1 className="font-serif text-xl font-bold text-coffee-900">{t("corporate.quote.readyTitle")}</h1>
        <p className="mt-1 text-sm text-coffee-600">{t("corporate.quote.readySub", { ref: quote.ref })}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> {t("corporate.quote.download")}
          </button>
          <a className="btn btn-outline" href={waLink(waSummary)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> {t("corporate.quote.whatsapp")}
          </a>
          <button type="button" className="btn btn-ghost" onClick={onEdit}>
            <ArrowLeft className="h-4 w-4" /> {t("corporate.quote.editRequest")}
          </button>
        </div>
      </div>

      {/* Printable document */}
      <div className="print-page rounded-2xl border border-coffee-100 bg-white p-8 shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-coffee-100 pb-5">
          <div>
            <p className="font-serif text-2xl font-bold text-coffee-900">{BRAND.name}</p>
            <p className="text-xs text-coffee-500">{BRAND.legalName}</p>
            <p className="text-xs text-coffee-500">{BRAND.licenseAuthority}</p>
            {sellerValueSet(BRAND.trn) && (
              <p className="text-xs text-coffee-500">{t("footer.trn")}: {BRAND.trn}</p>
            )}
          </div>
          <div className="text-end">
            <p className="text-lg font-bold uppercase tracking-wide text-gold-600">{t("corporate.quote.title")}</p>
            <p className="text-sm text-coffee-700">{t("corporate.quote.ref")}: <span className="font-semibold">{quote.ref}</span></p>
            <p className="text-xs text-coffee-500">{t("corporate.quote.date")}: {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-coffee-500">{t("corporate.quote.validity")}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-coffee-400">{t("corporate.quote.preparedFor")}</p>
            <p className="mt-1 font-semibold text-coffee-900">{f.company || "-"}</p>
            <p className="text-sm text-coffee-600">{f.contact}</p>
            <p className="text-sm text-coffee-600">{f.phone} · {f.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-coffee-400">{t("corporate.quote.event")}</p>
            <p className="mt-1 text-sm text-coffee-700">{t(`corporate.form.eventTypes.${f.eventType}`)}</p>
            <p className="text-sm text-coffee-600">{f.location} · {f.eventDate || "-"}</p>
            <p className="text-sm text-coffee-600">{f.guests} {t("corporate.form.guests")}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-coffee-200 text-start text-xs uppercase tracking-wide text-coffee-400">
              <th className="py-2 text-start">{t("corporate.quote.lineItem")}</th>
              <th className="py-2 text-end">{t("corporate.quote.qty")}</th>
              <th className="py-2 text-end">{t("corporate.quote.unit")}</th>
              <th className="py-2 text-end">{t("corporate.quote.amount")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-coffee-100">
            {quote.lines.map((l, i) => (
              <tr key={i}>
                <td className="py-2.5 text-coffee-800">{pick(l.description)}</td>
                <td className="py-2.5 text-end text-coffee-600">{l.qty}</td>
                <td className="py-2.5 text-end text-coffee-600">{l.unit.toLocaleString()}</td>
                <td className="py-2.5 text-end font-medium text-coffee-900">{(l.qty * l.unit).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ms-auto max-w-xs space-y-1 text-sm">
          <SummaryRow label={t("corporate.quote.subtotal")} value={formatAed(quote.subtotal, lang)} />
          <SummaryRow label={t("corporate.quote.vat")} value={formatAed(quote.vat, lang)} />
          <div className="border-t border-coffee-200 pt-1">
            <SummaryRow label={t("corporate.quote.total")} value={formatAed(quote.total, lang)} strong />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-cream-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-coffee-500">{t("corporate.quote.notes")}</p>
          <p className="mt-1 text-xs leading-relaxed text-coffee-600">{t("corporate.quote.notesBody")}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold text-coffee-900" : "text-coffee-500"}>{label}</span>
      <span className={strong ? "font-serif text-lg font-bold text-coffee-900" : "text-coffee-700"}>{value}</span>
    </div>
  );
}
