"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FileUp, Lock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PulseDot } from "@/components/motion/pulse-dot";
import { StaggerInView, StaggerItem } from "@/components/motion/stagger";
import { getTheme } from "@/lib/themes";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatDate } from "@/lib/utils/dates";
import type { DbProject } from "@/types/database";

export function ProjectDetailView({ project }: { project: DbProject }) {
  const { t, dir, locale } = useLocale();
  const theme = getTheme(project.theme);
  const themeName = locale === "ar" ? theme.name_ar : theme.name_en;

  const steps = [
    { title: t.projects.stepUpload, body: t.projects.stepUploadBody },
    { title: t.projects.stepExtract, body: t.projects.stepExtractBody },
    { title: t.projects.stepBrief, body: t.projects.stepBriefBody },
    { title: t.projects.stepPublish, body: t.projects.stepPublishBody },
  ];

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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <PulseDot status={project.status} />
          <h1 className="display-tight text-3xl font-bold text-brand-navy sm:text-4xl">
            {project.name}
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {t.subjects[project.subject]} · {themeName}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t.projects.sourceDocs}</CardTitle>
            </CardHeader>
            <CardBody>
              <motion.div
                whileHover={{ borderColor: "#171C8F" }}
                className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 py-12 text-center transition-colors"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white shadow-sm"
                >
                  <FileUp className="h-5 w-5 text-brand-navy" />
                </motion.div>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  {t.projects.noDocuments}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t.projects.uploadComing}
                </p>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t.projects.projectInfo}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <InfoRow
                label={t.projects.authority}
                value={
                  locale === "ar" && project.client_authority_ar
                    ? project.client_authority_ar
                    : project.client_authority_en
                }
              />
              <InfoRow
                label="Counterparty"
                value={
                  locale === "ar" && project.counterparty_ar
                    ? project.counterparty_ar
                    : project.counterparty_en
                }
              />
              <InfoRow
                label="Start"
                value={
                  project.start_date ? formatDate(project.start_date) : null
                }
              />
              <InfoRow
                label="End"
                value={project.end_date ? formatDate(project.end_date) : null}
              />
              <InfoRow label="Theme" value={themeName} />
              <InfoRow
                label={t.projects.created}
                value={formatDate(project.created_at)}
              />
            </CardBody>
          </Card>
        </motion.div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                  {t.projects.nextSteps}
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <StaggerInView
                className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"
                staggerChildren={0.08}
              >
                {steps.map((step, i) => (
                  <StaggerItem key={step.title}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 18,
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="num inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-600">
                          <Lock className="h-2.5 w-2.5" />
                          {t.projects.stepLocked}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-brand-navy">
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {step.body}
                      </p>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerInView>

              <div className="mt-6 flex gap-3">
                <Button disabled>
                  <FileUp className="h-4 w-4" />
                  {t.projects.uploadDocs}
                </Button>
                <Link href="/projects">
                  <Button variant="secondary">{t.projects.backToProjects}</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-800">{value || "-"}</span>
    </div>
  );
}
