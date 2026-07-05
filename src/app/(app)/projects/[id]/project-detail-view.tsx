"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Building2,
  Handshake,
  Palette,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PulseDot } from "@/components/motion/pulse-dot";
import { Section } from "@/components/ui/section";
import { getTheme } from "@/lib/themes";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatDate } from "@/lib/utils/dates";
import type { DbProject } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import { deleteProjectAction } from "../../new/actions";
import { ProjectPipeline } from "./project-pipeline";

export function ProjectDetailView({ project }: { project: DbProject }) {
  const { t, dir, locale } = useLocale();
  const theme = getTheme(project.theme);
  const themeName = locale === "ar" ? theme.name_ar : theme.name_en;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const authority =
    (locale === "ar" && project.client_authority_ar) ||
    project.client_authority_en ||
    null;
  const counterparty =
    (locale === "ar" && project.counterparty_ar) ||
    project.counterparty_en ||
    null;

  return (
    <div dir={dir}>
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-navy"
      >
        {dir === "rtl" ? (
          <ArrowRight className="h-3.5 w-3.5" />
        ) : (
          <ArrowLeft className="h-3.5 w-3.5" />
        )}
        {t.projects.backToProjects}
      </Link>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-navy">
              <Sparkles className="h-3 w-3 text-brand-gold" />
              {t.subjects[project.subject]}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <PulseDot status={project.status} />
              <h1 className="display-tight text-2xl font-bold text-brand-navy sm:text-3xl md:text-[2.2rem]">
                {project.name}
              </h1>
            </div>
            {(authority || counterparty) && (
              <p className="mt-2 text-sm text-slate-500">
                {authority ?? ""}
                {authority && counterparty ? " ↔ " : ""}
                {counterparty ?? ""}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="text-slate-500 hover:text-brand-red"
          >
            <Trash2 className="h-4 w-4" />
            {t.common.delete}
          </Button>
        </div>
      </motion.header>

      {/* Two-column workspace */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProjectPipeline project={project} />
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-5"
        >
          <Section title={t.projects.projectInfo}>
            <dl className="space-y-3 text-sm">
              <InfoRow
                icon={<Building2 className="h-3.5 w-3.5" />}
                label={t.projects.authority}
                value={authority}
              />
              <InfoRow
                icon={<Handshake className="h-3.5 w-3.5" />}
                label={locale === "ar" ? "الطرف المقابل" : "Counterparty"}
                value={counterparty}
              />
              <InfoRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label={locale === "ar" ? "تاريخ البدء" : "Start"}
                value={project.start_date ? formatDate(project.start_date) : null}
              />
              <InfoRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label={locale === "ar" ? "تاريخ الانتهاء" : "End"}
                value={project.end_date ? formatDate(project.end_date) : null}
              />
              <InfoRow
                icon={<Palette className="h-3.5 w-3.5" />}
                label={locale === "ar" ? "الهوية" : "Theme"}
                value={themeName}
              />
              <InfoRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label={t.projects.created}
                value={formatDate(project.created_at)}
              />
            </dl>
          </Section>

          <Link href="/projects" className="block">
            <Button variant="secondary" size="sm" className="w-full">
              {t.projects.backToProjects}
            </Button>
          </Link>
        </motion.aside>
      </div>

      <DeleteConfirm
        open={confirmOpen}
        projectId={project.id}
        projectName={project.name}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="inline-flex items-center gap-1.5 text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </dt>
      <dd className={cn("text-end text-slate-800", !value && "text-slate-300")}>
        {value || "—"}
      </dd>
    </div>
  );
}

function DeleteConfirm({
  open,
  projectId,
  projectName,
  onClose,
}: {
  open: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-red/10 text-brand-red">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="display-tight text-lg font-semibold text-slate-900">
                    {locale === "ar" ? "حذف المشروع؟" : "Delete project?"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {locale === "ar"
                      ? `سيتم حذف "${projectName}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`
                      : `"${projectName}" will be permanently removed. This action cannot be undone.`}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  {t.common.cancel}
                </Button>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={projectId} />
                  <Button type="submit" variant="danger">
                    <Trash2 className="h-4 w-4" />
                    {t.common.delete}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
