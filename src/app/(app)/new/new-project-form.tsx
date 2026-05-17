"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { themeOrder, themes } from "@/lib/themes";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { ThemeId } from "@/lib/themes/types";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast";
import { useEffect } from "react";
import { createProjectAction, type CreateProjectState } from "./actions";

const initialState: CreateProjectState = { ok: true };

export function NewProjectForm() {
  const { t, locale, dir } = useLocale();
  const toast = useToast();
  const [state, formAction, pending] = useActionState(
    createProjectAction,
    initialState,
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("civic");
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error, toast]);

  return (
    <form action={formAction} className="space-y-6" dir={dir}>
      <div className="space-y-2">
        <Label htmlFor="name">{t.newProject.projectName}</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder={t.newProject.projectNamePlaceholder}
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="text-xs text-brand-red">{errors.name}</p>
        ) : (
          <p className="text-xs text-slate-500">
            {t.newProject.projectNameHint}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject">{t.newProject.subject}</Label>
          <Select
            id="subject"
            name="subject"
            required
            defaultValue="contract_management"
          >
            <option value="contract_management">
              {t.newProject.subjectContract}
            </option>
            <option value="tender_evaluation">
              {t.newProject.subjectTender}
            </option>
            <option value="operations_maintenance">
              {t.newProject.subjectOps}
            </option>
            <option value="construction">
              {t.newProject.subjectConstruction}
            </option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">{t.newProject.theme}</Label>
          <Select
            id="theme"
            name="theme"
            required
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value as ThemeId)}
          >
            {themeOrder.map((id) => (
              <option key={id} value={id}>
                {locale === "ar" ? themes[id].name_ar : themes[id].name_en}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">{t.newProject.themeHint}</p>
        </div>
      </div>

      <ThemePreview themeId={selectedTheme} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_authority_en">
            {t.newProject.authorityClient}
          </Label>
          <Input
            id="client_authority_en"
            name="client_authority_en"
            placeholder={t.newProject.authorityClientPlaceholder}
          />
          <p className="text-xs text-slate-500">
            {t.newProject.authorityClientHint}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_authority_ar">
            {t.newProject.authorityClientAr}
          </Label>
          <Input
            id="client_authority_ar"
            name="client_authority_ar"
            dir="rtl"
            lang="ar"
            placeholder="جهة حكومية"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty_en">{t.newProject.counterparty}</Label>
          <Input
            id="counterparty_en"
            name="counterparty_en"
            placeholder={t.newProject.counterpartyPlaceholder}
          />
          <p className="text-xs text-slate-500">
            {t.newProject.counterpartyHint}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty_ar">{t.newProject.counterpartyAr}</Label>
          <Input
            id="counterparty_ar"
            name="counterparty_ar"
            dir="rtl"
            lang="ar"
            placeholder="شركة استشارات"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">{t.newProject.startDate}</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">{t.newProject.endDate}</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t.newProject.submitting : t.newProject.submit}
        </Button>
        <Link href="/projects">
          <Button variant="secondary" type="button">
            {t.newProject.cancel}
          </Button>
        </Link>
      </div>
    </form>
  );
}

function ThemePreview({ themeId }: { themeId: ThemeId }) {
  const theme = themes[themeId];
  const { locale } = useLocale();
  return (
    <motion.div
      layout
      initial={false}
      className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {locale === "ar" ? "معاينة" : "Preview"}
          </p>
          <p className="display-tight text-sm font-semibold text-slate-800">
            {locale === "ar" ? theme.name_ar : theme.name_en}
          </p>
          <p className="mt-0.5 max-w-[18rem] text-[11px] leading-snug text-slate-500">
            {locale === "ar" ? theme.description_ar : theme.description_en}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            theme.brand.primary,
            theme.brand.secondary,
            theme.brand.accent,
          ].map((color) => (
            <motion.span
              key={color}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-green" />
          {locale === "ar" ? "أخضر" : "Green"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-amber" />
          {locale === "ar" ? "كهرماني" : "Amber"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-status-red" />
          {locale === "ar" ? "أحمر" : "Red"}
        </span>
        <span className={cn("text-[10px] sm:ms-auto")}>
          {locale === "ar"
            ? "ألوان الحالة لا تتغيّر"
            : "Status palette never changes"}
        </span>
      </div>
    </motion.div>
  );
}
