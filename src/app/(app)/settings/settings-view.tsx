"use client";

import { motion } from "motion/react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/locale-provider";
import { mockSession } from "@/lib/store/mock-store";

export function SettingsView() {
  const { t, dir, locale } = useLocale();

  return (
    <div className="mx-auto max-w-3xl" dir={dir}>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="display-tight mb-6 text-3xl font-bold text-rta-navy sm:text-4xl"
      >
        {t.settings.title}
      </motion.h1>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.profile}</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Row
                  label={t.settings.labels.name}
                  value={mockSession.user.full_name}
                />
                <Row
                  label={t.settings.labels.email}
                  value={mockSession.user.email}
                />
                <Row
                  label={t.settings.labels.locale}
                  value={locale === "ar" ? "العربية" : "English"}
                />
                <Row label={t.settings.labels.theme} value="RTA" />
              </dl>
              <p className="mt-6 text-xs text-slate-500">
                {t.settings.profileNote}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.system}</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Row
                  label={t.settings.labels.phase}
                  value={t.settings.values.phase}
                />
                <Row
                  label={t.settings.labels.supabase}
                  value={t.settings.values.notConnected}
                />
                <Row
                  label={t.settings.labels.anthropic}
                  value={t.settings.values.notConnected}
                />
                <Row
                  label={t.settings.labels.build}
                  value={t.settings.values.build}
                />
              </dl>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value ?? "-"}</dd>
    </div>
  );
}
