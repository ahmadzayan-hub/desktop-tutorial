"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, FolderPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PulseDot } from "@/components/motion/pulse-dot";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatDate } from "@/lib/utils/dates";
import type { DbProject } from "@/types/database";

export function ProjectsView({ projects }: { projects: DbProject[] }) {
  const { t, dir, locale } = useLocale();

  return (
    <div dir={dir}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="display-tight text-3xl font-bold text-rta-navy sm:text-4xl"
          >
            {t.projects.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-sm text-slate-500"
          >
            {t.projects.subtitle}
          </motion.p>
        </div>
        <Link href="/new">
          <Button>
            <FolderPlus className="h-4 w-4" />
            {t.projects.newProject}
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/projects/${project.id}` as never}>
                <motion.div
                  whileHover={{ x: dir === "rtl" ? -4 : 4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardBody className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <PulseDot status={project.status} />
                          <h2 className="display-tight truncate text-lg font-semibold text-rta-navy">
                            {project.name}
                          </h2>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                          <span>
                            {t.projects.subject}:{" "}
                            <span className="text-slate-700">
                              {t.subjects[project.subject]}
                            </span>
                          </span>
                          <span>
                            {t.projects.created}:{" "}
                            <span className="text-slate-700">
                              {formatDate(project.created_at)}
                            </span>
                          </span>
                          {project.client_authority_en && (
                            <span>
                              {t.projects.authority}:{" "}
                              <span className="text-slate-700">
                                {locale === "ar" && project.client_authority_ar
                                  ? project.client_authority_ar
                                  : project.client_authority_en}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        className={
                          "h-4 w-4 text-slate-400 " +
                          (dir === "rtl" ? "rotate-180" : "")
                        }
                      />
                    </CardBody>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const { t } = useLocale();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardBody className="relative overflow-hidden py-20 text-center">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rta-navy/5 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-rta-gold/10 blur-2xl" />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rta-navy text-white shadow-lg"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          <p className="relative mt-6 text-base font-medium text-slate-800">
            {t.projects.empty}
          </p>
          <p className="relative mx-auto mt-1 max-w-md text-sm text-slate-500">
            {t.projects.emptyHint}
          </p>
          <div className="relative mt-6">
            <Link href="/new">
              <Button size="lg">
                <FolderPlus className="h-4 w-4" />
                {t.projects.newProject}
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
