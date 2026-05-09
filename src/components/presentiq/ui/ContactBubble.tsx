"use client";

import { useI18n } from "@/lib/presentiq/i18n/context";

const CONTACT_EMAIL = "Ahmad.zaian@outlook.com";

export function ContactBubble() {
  const { t, dir } = useI18n();
  const subject = encodeURIComponent("PresentIQ — trial feedback");
  const body = encodeURIComponent(
    "Hi Ahmad,\n\nI tried PresentIQ and have a question / suggestion:\n\n— Sent from the in-app contact bubble"
  );
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}
      className="pq-bubble"
      style={{ direction: dir }}
      aria-label={t("ctc.email")}
    >
      <span aria-hidden>✉</span>
      {t("ctc.email")}
    </a>
  );
}
