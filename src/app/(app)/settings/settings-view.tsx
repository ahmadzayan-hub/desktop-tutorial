"use client";

import { motion } from "motion/react";
import { User, Cpu, Database, Hammer } from "lucide-react";
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
        className="display-tight mb-6 text-2xl font-bold text-brand-navy sm:text-3xl md:text-4xl"
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
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-navy" />
                  {t.settings.profile}
                </span>
              </CardTitle>
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
                <Row
                  label={t.settings.labels.theme}
                  value={locale === "ar" ? "حكومي" : "Civic"}
                />
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
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-brand-navy" />
                  {t.settings.system}
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <Row
                  icon={<Hammer className="h-3.5 w-3.5" />}
                  label={t.settings.labels.phase}
                  value={t.settings.values.phase}
                />
                <Row
                  icon={<Database className="h-3.5 w-3.5" />}
                  label={t.settings.labels.supabase}
                  value={t.settings.values.notConnected}
                />
                <Row
                  icon={<Cpu className="h-3.5 w-3.5" />}
                  label={t.settings.labels.anthropic}
                  value={t.settings.values.notConnected}
                />
                <Row
                  icon={<Hammer className="h-3.5 w-3.5" />}
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

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800">{value ?? "-"}</dd>
    </div>
  );
}
