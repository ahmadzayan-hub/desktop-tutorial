"use client";

import { motion } from "motion/react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/locale-provider";
import { NewProjectForm } from "./new-project-form";

export function NewProjectView() {
  const { t, dir } = useLocale();
  return (
    <div className="mx-auto max-w-3xl" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="display-tight text-3xl font-bold text-brand-navy sm:text-4xl">
          {t.newProject.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t.newProject.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t.newProject.projectDetails}</CardTitle>
          </CardHeader>
          <CardBody>
            <NewProjectForm />
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
