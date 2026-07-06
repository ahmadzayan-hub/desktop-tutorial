import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { BrandGem } from "@/components/BrandLogo";
import { track } from "@/lib/analytics";

// Chrome/Android fire `beforeinstallprompt`; we defer it and surface our own
// tasteful button so buyers can add Beyond Style to their home screen.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "bsu_install_dismissed";

export function InstallPrompt() {
  const { t, locale } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      track("pwa_installed", {});
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    track("pwa_install_prompt", { outcome });
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 start-4 z-40 md:bottom-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2 rounded-full border border-gold/25 bg-ink/95 py-1.5 pe-1.5 ps-3 shadow-glow backdrop-blur">
        <BrandGem size={20} />
        <button
          onClick={install}
          className="flex items-center gap-1.5 rounded-full bg-gold-gradient px-3 py-1.5 text-sm font-semibold text-ink"
        >
          <Download size={15} />
          {t("install.cta")}
        </button>
        <button
          onClick={dismiss}
          aria-label={t("install.dismiss")}
          className="grid h-7 w-7 place-items-center rounded-full text-cream/50 hover:text-cream"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
