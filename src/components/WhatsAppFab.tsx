import { useI18n } from "@/i18n/I18nContext";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

/**
 * WhatsApp corporate/support entry point.
 *
 * Anti-overlap design:
 *  - Icon-only 56px circle on mobile (tiny footprint, bottom-end, safe-area
 *    inset), expanding to a labelled pill only on md+ where there's room.
 *  - The app's <main> reserves bottom padding (see Layout) so the FAB never
 *    covers page content or a CTA.
 *  - z-40 keeps it below the header (z-50) and any open modal.
 */
export function WhatsAppFab() {
  const { t, pick } = useI18n();
  return (
    <a
      href={waLink(pick(WA_MESSAGES.corporate))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("trust.whatsapp")}
      className="no-print group fixed z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-0 py-0 text-white shadow-lg transition-transform hover:scale-105 active:scale-95
                 bottom-[calc(1rem+env(safe-area-inset-bottom))] end-4
                 md:bottom-6 md:end-6 md:px-5 md:py-3.5"
    >
      <span className="grid h-14 w-14 place-items-center md:h-auto md:w-auto">
        <svg viewBox="0 0 32 32" className="h-7 w-7 md:h-6 md:w-6" fill="currentColor" aria-hidden="true">
          <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3Zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C5.5 9.5 10.2 4.8 16 4.8S26.5 9.5 26.5 15 21.8 24.8 16 24.8Zm5.7-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4Z" />
        </svg>
      </span>
      <span className="hidden pe-1 text-sm font-semibold md:inline">{t("nav.corporate")}</span>
    </a>
  );
}
