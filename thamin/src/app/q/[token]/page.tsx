import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import QuoteActions from '@/components/QuoteActions';
import { LogoMark } from '@/components/Logo';

export const dynamic = 'force-dynamic';

interface Item {
  name: string;
  nameAr?: string;
  qty: number;
  unitPrice: number;
  total: number;
}

const fmt = (n: number) => new Intl.NumberFormat('en-AE', { maximumFractionDigits: 2 }).format(n);

// Customer-facing quotation. Shows price only — never cost, margin or profit.
export default async function PublicQuotePage({ params }: { params: { token: string } }) {
  const quote = await prisma.quote.findUnique({ where: { publicToken: params.token } });
  if (!quote) notFound();

  const ar = quote.language === 'ar';
  const items: Item[] = JSON.parse(quote.itemsJson);
  const expired = quote.validUntil.getTime() < Date.now();

  const terms = ar
    ? 'السعر شامل التغليف والتجهيز. التوصيل داخل الإمارات حسب المنطقة. السعر صالح لمدة 24 ساعة بسبب تغير أسعار الخامات.'
    : 'The price includes preparation and packaging. UAE delivery depends on the area. This quote is valid for 24 hours due to material price changes.';

  const waLines = [
    ar ? '✨ بيوند ستايل الإمارات' : '✨ Beyond Style UAE',
    ...items.map((i) => `${ar && i.nameAr ? i.nameAr : i.name} × ${i.qty} = ${fmt(i.total)} AED`),
    quote.deliveryCost > 0 ? (ar ? `التوصيل: ${fmt(quote.deliveryCost)} درهم` : `Delivery: AED ${fmt(quote.deliveryCost)}`) : '',
    ar ? `الإجمالي: *${fmt(quote.total)} درهم*` : `Total: *AED ${fmt(quote.total)}*`,
    '',
    terms,
    ar ? `رقم العرض: ${quote.number}` : `Quote no: ${quote.number}`,
  ].filter(Boolean);
  const whatsappText = waLines.join('\n');
  const instagramText = ar
    ? `مرحباً 🌟 سعر ${items[0] ? (items[0].nameAr || items[0].name) : 'القطعة'}: ${fmt(quote.total)} درهم شامل التغليف. التوصيل حسب المنطقة. العرض صالح 24 ساعة 💛`
    : `Hi 🌟 The price for ${items[0]?.name ?? 'this piece'} is AED ${fmt(quote.total)} including packaging. Delivery depends on your area. Valid for 24h 💛`;

  return (
    <div dir={ar ? 'rtl' : 'ltr'} lang={quote.language} className="min-h-screen bg-luxe">
      <div className="mx-auto max-w-xl px-4 py-6">
        {/* branded header */}
        <div className="rounded-t-2xl bg-ink p-5 text-center">
          <div className="mx-auto mb-2 w-fit"><LogoMark size={52} /></div>
          <h1 className="text-lg font-bold text-gold">Beyond Style UAE</h1>
          <p className="text-xs text-white/70">{ar ? 'عرض سعر' : 'Price Quotation'} | {quote.number}</p>
        </div>

        <div className="rounded-b-2xl bg-white p-5 shadow-card">
          {expired && (
            <p className="mb-3 rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">
              {ar ? 'انتهت صلاحية هذا العرض. يرجى طلب عرض محدث.' : 'This quote has expired. Please request an updated one.'}
            </p>
          )}
          {quote.customerName && (
            <p className="mb-3 text-sm text-neutral-600">
              {ar ? 'إلى:' : 'To:'} <strong>{quote.customerName}</strong>
            </p>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-400">
                <th className="py-2 text-start">{ar ? 'المنتج' : 'Item'}</th>
                <th className="py-2 text-center">{ar ? 'الكمية' : 'Qty'}</th>
                <th className="py-2 text-end">{ar ? 'السعر' : 'Price'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx} className="border-b border-neutral-100">
                  <td className="py-2">{ar && i.nameAr ? i.nameAr : i.name}</td>
                  <td className="num py-2 text-center">{i.qty}</td>
                  <td className="num py-2 text-end">{fmt(i.total)} AED</td>
                </tr>
              ))}
              {quote.deliveryCost > 0 && (
                <tr className="border-b border-neutral-100">
                  <td className="py-2">{ar ? 'التوصيل' : 'Delivery'}</td>
                  <td />
                  <td className="num py-2 text-end">{fmt(quote.deliveryCost)} AED</td>
                </tr>
              )}
              {quote.vatMode === 'EXCLUSIVE' && quote.vatAmount > 0 && (
                <tr className="border-b border-neutral-100 text-neutral-500">
                  <td className="py-2">{ar ? 'ضريبة القيمة المضافة 5٪' : 'VAT 5%'}</td>
                  <td />
                  <td className="num py-2 text-end">{fmt(quote.vatAmount)} AED</td>
                </tr>
              )}
              <tr className="text-base font-bold">
                <td className="py-3">{ar ? 'الإجمالي' : 'Total'}</td>
                <td />
                <td className="num py-3 text-end text-gold-dark">{fmt(quote.total)} AED</td>
              </tr>
            </tbody>
          </table>
          {quote.vatMode === 'INCLUSIVE' && quote.vatAmount > 0 && (
            <p className="text-xs text-neutral-400">
              {ar ? `السعر شامل ضريبة القيمة المضافة (${fmt(quote.vatAmount)} درهم)` : `Price includes VAT (AED ${fmt(quote.vatAmount)})`}
            </p>
          )}

          <div className="mt-4 space-y-1 rounded-xl bg-luxe p-3 text-xs text-neutral-600">
            <p>📦 {ar ? `مدة التوصيل: ${quote.deliveryDays ?? '1-3'} أيام عمل` : `Delivery timeline: ${quote.deliveryDays ?? '1-3'} working days`}</p>
            <p>⏳ {ar ? 'صالح حتى:' : 'Valid until:'} <span className="num">{quote.validUntil.toLocaleString(ar ? 'ar-AE' : 'en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
            <p>💳 {ar ? 'رابط الدفع: يُرسل عند التأكيد' : 'Payment link: sent upon confirmation'}</p>
            <p className="pt-1 border-t border-neutral-200">{terms}</p>
          </div>

          <QuoteActions whatsappText={whatsappText} instagramText={instagramText} ar={ar} phone={quote.customerPhone} />
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400">Beyond Style UAE | beyondstyle.ae</p>
      </div>
    </div>
  );
}
