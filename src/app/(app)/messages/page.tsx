"use client";

import { useI18n } from "@/lib/i18n/context";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { t, dir } = useI18n();
  return (
    <div className="p-6 text-center py-20" dir={dir}>
      <MessageSquare className="w-14 h-14 text-slate-300 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("messages.title")}</h1>
      <p className="text-slate-500">{t("messages.comingSoon")}</p>
    </div>
  );
}
