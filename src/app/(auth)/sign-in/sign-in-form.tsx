"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/locale-provider";

export function SignInForm() {
  const { t, dir } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => {
      router.push("/projects");
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      dir={dir}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t.auth.signInTitle}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">{t.auth.signInSub}</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@authority.gov.ae"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {t.auth.authNotConfigured}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "…" : t.auth.submitSignIn}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {t.auth.noAccount}{" "}
            <Link
              href="/sign-up"
              className="font-medium text-brand-navy hover:underline"
            >
              {t.nav.signUp}
            </Link>
          </p>
        </CardBody>
      </Card>
    </motion.div>
  );
}
