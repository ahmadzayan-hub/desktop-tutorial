import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AskOnWhatsApp } from "@/components/ui/AskOnWhatsApp";

export default function ThankYou() {
  const [params] = useSearchParams();
  const { t } = useI18n();
  const order = params.get("order");

  const trackingMessage = `${t("wa.trackOrder")} ${order ?? ""}`;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto text-gold" size={56} />
      <h1 className="mt-4 font-display text-2xl gold-text">{t("ty.title")}</h1>
      <p className="mt-3 text-cream/75">{t("ty.body")}</p>
      {order && (
        <p className="btn-outline mt-3 inline-block px-3 py-1 font-mono text-xs text-cream/60">
          #{order}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="gold-cta">{t("ty.continue")}</Link>
        <AskOnWhatsApp message={trackingMessage} label={t("ty.trackLabel")} />
      </div>
    </div>
  );
}
