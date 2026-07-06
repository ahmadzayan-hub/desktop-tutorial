import { Truck, ShieldCheck, MessageCircle, MapPin } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { InstallButton } from "./InstallPrompt";

/** Slim top bar: rotating trust points (marquee on mobile) + install CTA. */
export function AnnouncementBar() {
  const { t } = useI18n();
  const items = [
    { Icon: Truck, text: t("announce.a") },
    { Icon: MapPin, text: t("announce.b") },
    { Icon: ShieldCheck, text: t("announce.c") },
    { Icon: MessageCircle, text: t("announce.d") },
  ];

  return (
    <div className="no-print bg-coffee-700 text-cream-100">
      <div className="container-max flex h-9 items-center justify-between gap-4">
        {/* Static row on md+ */}
        <ul className="hidden items-center gap-6 text-xs md:flex">
          {items.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-gold-400" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* Marquee on mobile */}
        <div className="flex-1 overflow-hidden md:hidden">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs">
            {[...items, ...items].map(({ Icon, text }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-gold-400" />
                {text}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 md:block [&_.btn]:!border-cream-100/25 [&_.btn]:!bg-transparent [&_.btn]:!text-cream-50 [&_.btn]:hover:!border-gold-400">
          <InstallButton />
        </div>
      </div>
    </div>
  );
}
