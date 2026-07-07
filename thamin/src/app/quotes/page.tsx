import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { prisma } from '@/lib/db';
import { getDict, getLocale, fmtAed } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <AppShell title={t.quotes}>
      <div className="mb-4">
        <Link href="/quotes/new" className="btn-gold w-full md:w-auto">
          + {t.createCustomerQuote}
        </Link>
      </div>
      <div className="space-y-2">
        {quotes.length === 0 && (
          <p className="card text-center text-sm text-neutral-400">
            {locale === 'ar' ? 'لا توجد عروض أسعار بعد.' : 'No quotes yet.'}
          </p>
        )}
        {quotes.map((q) => {
          const expired = q.validUntil.getTime() < Date.now();
          return (
            <Link key={q.id} href={`/q/${q.publicToken}`} className="card flex items-center justify-between gap-2 hover:shadow-lg">
              <div>
                <p className="font-bold">{q.number}</p>
                <p className="text-xs text-neutral-400">
                  {q.customerName || (locale === 'ar' ? 'بدون اسم' : 'No name')} | {q.channelKey ?? '-'} |{' '}
                  {q.createdAt.toLocaleDateString('en-AE')} | {q.createdBy?.name ?? ''}
                </p>
              </div>
              <div className="text-end">
                <p className="num font-bold text-gold-dark">{fmtAed(q.total, locale)}</p>
                <span className={`badge ${expired ? 'bg-neutral-100 text-neutral-500' : 'bg-green-100 text-green-700'}`}>
                  {expired ? (locale === 'ar' ? 'منتهي' : 'Expired') : (locale === 'ar' ? 'صالح' : 'Valid')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
