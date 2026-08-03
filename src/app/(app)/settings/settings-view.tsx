"use client";

import { motion } from "motion/react";
import { CheckCircle2, Cpu, Database, Hammer, ShieldCheck, User } from "lucide-react";
import { Section } from "@/components/ui/section";
import { SelfTestPanel } from "./self-test-panel";
import { useLocale } from "@/lib/i18n/locale-provider";
import { cn } from "@/lib/utils/cn";

interface SettingsUser {
  full_name: string;
  email: string;
  /** true when the user info comes from a real Supabase session. */
  real: boolean;
}

interface Props {
  user: SettingsUser;
  supabaseConfigured: boolean;
  anthropicConfigured: boolean;
}

export function SettingsView({
  user,
  supabaseConfigured,
  anthropicConfigured,
}: Props) {
  const { t, dir, locale } = useLocale();
  const isAr = locale === "ar";

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
          <Section
            icon={<User className="h-4 w-4" />}
            title={t.settings.profile}
            hint={
              user.real
                ? isAr
                  ? "بيانات مأخوذة من جلستك الحاليّة."
                  : "Data from your current Supabase session."
                : t.settings.profileNote
            }
          >
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Row label={t.settings.labels.name} value={user.full_name} />
              <Row label={t.settings.labels.email} value={user.email} />
              <Row
                label={t.settings.labels.locale}
                value={locale === "ar" ? "العربية" : "English"}
              />
              <Row
                label={t.settings.labels.theme}
                value={locale === "ar" ? "حكومي" : "Civic"}
              />
            </dl>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Section
            icon={<Hammer className="h-4 w-4" />}
            title={t.settings.system}
          >
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <StatusRow
                icon={<Hammer className="h-3.5 w-3.5" />}
                label={t.settings.labels.phase}
                value={
                  isAr
                    ? "٣أ · مصادقة وقاعدة بيانات"
                    : "3a · auth + persistence"
                }
                ok
              />
              <StatusRow
                icon={<Database className="h-3.5 w-3.5" />}
                label={t.settings.labels.supabase}
                value={
                  supabaseConfigured
                    ? isAr
                      ? "متّصل"
                      : "Connected"
                    : t.settings.values.notConnected
                }
                ok={supabaseConfigured}
              />
              <StatusRow
                icon={<Cpu className="h-3.5 w-3.5" />}
                label={t.settings.labels.anthropic}
                value={
                  anthropicConfigured
                    ? isAr
                      ? "مُعَدّ"
                      : "Configured"
                    : t.settings.values.notConnected
                }
                ok={anthropicConfigured}
              />
              <StatusRow
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label={isAr ? "معالجة على الجهاز" : "On-device AI"}
                value={isAr ? "متاح عبر WebGPU" : "Available via WebGPU"}
                ok
              />
              <StatusRow
                icon={<Hammer className="h-3.5 w-3.5" />}
                label={t.settings.labels.build}
                value={t.settings.values.build}
                ok
              />
            </dl>
          </Section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SelfTestPanel />
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}

function StatusRow({
  label,
  value,
  icon,
  ok,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  ok: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
          ok
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500",
        )}
      >
        {ok && <CheckCircle2 className="h-3 w-3" />}
        {value}
      </dd>
    </div>
  );
}
