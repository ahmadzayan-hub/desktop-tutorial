import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ThankYou() {
  const [params] = useSearchParams();
  const { locale } = useI18n();
  const order = params.get("order");

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto text-gold" size={56} />
      <h1 className="mt-4 font-display text-2xl gold-text">
        {locale === "ar" ? "شكرًا لطلبك!" : "Thank you for your order!"}
      </h1>
      <p className="mt-3 text-cream/70">
        {locale === "ar"
          ? "سنتواصل معك عبر واتساب لتأكيد الطلب قبل الشحن."
          : "We'll reach you on WhatsApp to confirm your order before dispatch."}
      </p>
      {order && <p className="mt-2 text-xs text-cream/40">Order #{order}</p>}
      <Link to="/" className="gold-cta mt-8 inline-block">
        {locale === "ar" ? "متابعة التسوق" : "Continue shopping"}
      </Link>
    </div>
  );
}
