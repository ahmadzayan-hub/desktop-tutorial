import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const WHATSAPP_NUMBER = "971501516707"; // E.164 without "+"
export const WHATSAPP_DISPLAY = "+971 50 151 6707";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Always-visible floating action button so buyers can ask before they buy. */
export function WhatsAppFab() {
  const { t } = useI18n();
  return (
    <a
      href={whatsappLink(t("wa.askAboutProduct"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("cart.askWhatsApp")}
      className="fixed bottom-20 end-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 md:bottom-6"
    >
      <MessageCircle size={22} />
    </a>
  );
}
