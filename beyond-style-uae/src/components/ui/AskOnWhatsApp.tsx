import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/components/WhatsAppFab";
import { useI18n } from "@/lib/i18n";

/**
 * Shared "Ask on WhatsApp" outline CTA. Falls back to a locale-appropriate
 * greeting when no `message` is supplied, so callers only pass a message
 * when they want to prefill product context.
 */
export function AskOnWhatsApp({
  message,
  label,
  size = "md",
  className = "",
}: {
  /** Prefill body of the WhatsApp message. Falls back to a locale greeting. */
  message?: string;
  /** Button label override. Defaults to `t("cart.askWhatsApp")`. */
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t, locale } = useI18n();
  const fallback = locale === "ar" ? "مرحباً، أريد الاستفسار" : "Hi, I'd like to ask";
  const padding = size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm";
  return (
    <a
      href={whatsappLink(message ?? fallback)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-outline inline-flex items-center gap-2 ${padding} ${className}`.trim()}
    >
      <MessageCircle size={16} />
      {label ?? t("cart.askWhatsApp")}
    </a>
  );
}
