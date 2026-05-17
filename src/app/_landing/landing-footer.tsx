"use client";

import Link from "next/link";
import { Wordmark } from "@/components/branding/wordmark";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LandingFooter() {
  const { t, dir } = useLocale();
  return (
    <footer className="border-t border-slate-200 bg-white" dir={dir}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <Wordmark size="md" showTagline />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              {t.tagline}
            </p>
          </div>

          <FooterColumn title={t.footer.product}>
            <FooterLink href="/#how">{t.footer.links.howItWorks}</FooterLink>
            <FooterLink href="/#pricing">{t.footer.links.pricing}</FooterLink>
            <FooterLink href="/#faq">{t.footer.links.faq}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t.footer.company}>
            <FooterLink href="/sign-in">{t.footer.links.signIn}</FooterLink>
            <FooterLink href="/sign-up">{t.footer.links.signUp}</FooterLink>
            <FooterLink href="mailto:hello@mutabasir.ae">
              {t.footer.links.contact}
            </FooterLink>
          </FooterColumn>

          <FooterColumn title={t.footer.legal}>
            <FooterLink href="/terms">{t.footer.links.terms}</FooterLink>
            <FooterLink href="/privacy">{t.footer.links.privacy}</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.built}</p>
          <p>{t.footer.version}</p>
          <p>mutabasir.ae</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="display-tight text-sm font-semibold text-brand-navy">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-600">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href as never}
        className="transition-colors hover:text-brand-navy"
      >
        {children}
      </Link>
    </li>
  );
}
