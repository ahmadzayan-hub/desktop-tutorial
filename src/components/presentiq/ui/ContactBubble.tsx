"use client";

import { useI18n } from "@/lib/presentiq/i18n/context";
import { PQ_CONTACT_EMAIL, PQ_FOUNDER_NAME } from "@/lib/presentiq/config";

export function ContactBubble() {
  const { t, dir } = useI18n();
  const subject = encodeURIComponent("PresentIQ — trial feedback");
  const body = encodeURIComponent(
    `Hi ${PQ_FOUNDER_NAME},\n\nI tried PresentIQ and have a question / suggestion:\n\n— Sent from the in-app contact bubble`,
  );
  return (
    <a
      href={`mailto:${PQ_CONTACT_EMAIL}?subject=${subject}&body=${body}`}
      className="pq-bubble"
      style={{ direction: dir }}
      aria-label={t("ctc.email")}
    >
      <span aria-hidden>✉</span>
      {t("ctc.email")}
    </a>
  );
}
