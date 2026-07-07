import { Suspense } from 'react';
import AppShell from '@/components/AppShell';
import QuoteForm from '@/components/QuoteForm';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { loadRules } from '@/lib/rules';

export const dynamic = 'force-dynamic';

export default async function NewQuotePage() {
  const locale = getLocale();
  const t = getDict(locale);
  const [channels, rules] = await Promise.all([
    prisma.channel.findMany({ where: { active: true } }),
    loadRules(),
  ]);

  return (
    <AppShell title={t.createCustomerQuote}>
      <Suspense>
        <QuoteForm
          locale={locale}
          channels={channels.map((c) => ({ key: c.key, name: locale === 'ar' ? c.nameAr : c.name }))}
          defaults={{ deliveryStandard: rules.deliveryStandard, deliveryRemote: rules.deliveryRemote }}
        />
      </Suspense>
    </AppShell>
  );
}
