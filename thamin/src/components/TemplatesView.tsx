'use client';

import { useState } from 'react';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

// Ready customer message templates used daily by the Beyond Style UAE team.
// Sourced from the operations master database so wording stays consistent.
interface Template {
  key: string;
  titleAr: string;
  titleEn: string;
  whenAr: string;
  whenEn: string;
  ar: string;
  en: string;
}

const TEMPLATES: Template[] = [
  {
    key: 'delivery-link',
    titleAr: 'إرسال رابط بيانات التوصيل',
    titleEn: 'Send the quick delivery link',
    whenAr: 'بعد تأكيد العميل للمنتج والسعر الإجمالي',
    whenEn: 'After the customer confirms the item and total',
    ar: 'تمام 🤍\nحتى نرتب التوصيل بسرعة وأمان، يرجى تعبئة رابط بيانات التوصيل السريع. لن يستغرق أكثر من دقيقة:\n[رابط التوصيل]',
    en: 'Perfect 🤍\nTo arrange safe and fast delivery, please fill this quick delivery link. It takes less than 1 minute:\n[Delivery Link]',
  },
  {
    key: 'online-payment',
    titleAr: 'خيار الدفع أونلاين',
    titleEn: 'Online payment option',
    whenAr: 'عند اختيار طريقة الدفع',
    whenEn: 'When choosing the payment method',
    ar: 'الدفع أونلاين هو الأسرع 💳\nسنرسل لك رابط دفع آمن، ويتم ترتيب التوصيل خلال 24 ساعة بعد تأكيد الدفع.',
    en: 'Online payment is the fastest option 💳\nWe will send you a secure payment link, and delivery is arranged within 24 hours after payment confirmation.',
  },
  {
    key: 'cod',
    titleAr: 'خيار الدفع عند الاستلام',
    titleEn: 'Cash on delivery option',
    whenAr: 'عندما يطلب العميل الدفع عند الاستلام',
    whenEn: 'When the customer asks for COD',
    ar: 'الدفع عند الاستلام متاح 💵\nيرجى تعبئة رابط التوصيل السريع حتى يتمكن المندوب من الوصول إليك بسهولة.',
    en: 'Cash on delivery is available 💵\nPlease fill the quick delivery link so our courier can reach you smoothly.',
  },
  {
    key: 'after-submission',
    titleAr: 'بعد استلام بيانات التوصيل',
    titleEn: 'After delivery details received',
    whenAr: 'بعد تعبئة النموذج أو التأكيد اليدوي',
    whenEn: 'After form submission or manual confirmation',
    ar: 'شكراً لك 🤍\nتم استلام بيانات التوصيل. سنجهز طلبك ونؤكد معك موعد التوصيل قريباً 📦✨',
    en: 'Thank you 🤍\nYour delivery details have been received. We will prepare your order and confirm the delivery time shortly 📦✨',
  },
  {
    key: 'review-request',
    titleAr: 'طلب تقييم بعد التوصيل',
    titleEn: 'Review request after delivery',
    whenAr: 'بعد تأكيد التسليم بيوم واحد',
    whenEn: 'One day after delivery confirmation',
    ar: 'نتمنى أن يكون طلبك من بيوند ستايل قد أعجبك 🤍\nرأيك يهمنا كثيراً. هل تسمحين لنا بمشاركة تقييمك على صفحتنا بدون إظهار أي بيانات خاصة؟',
    en: 'We hope you loved your Beyond Style order 🤍\nYour feedback means a lot to us. May we share your review on our page without showing any personal details?',
  },
  {
    key: 'repeat-offer',
    titleAr: 'عرض العميلة المميزة',
    titleEn: 'Returning customer offer',
    whenAr: 'بعد تقييم إيجابي',
    whenEn: 'After positive feedback',
    ar: 'تقديراً لك، لديك خصم 10% كعميلة مميزة على أي طلب جديد من قطعتين أو أكثر خلال 30 يوماً 🤍\nالخصم لا يشمل التوصيل.',
    en: 'As a thank you, you have a special 10% returning customer offer on any new order of 2 pieces or more within 30 days 🤍\nThe discount excludes delivery.',
  },
  {
    key: 'material-honesty',
    titleAr: 'رد الخامة (الادعاء الآمن)',
    titleEn: 'Material reply (safe claim)',
    whenAr: 'عندما يسأل العميل: هل هي فضة أصلية؟',
    whenEn: 'When the customer asks: is it real silver?',
    ar: 'ليست فضة أصلية. المنتج إكسسوار موضة من الستانلس ستيل بتشطيب لون فضي أنيق. وللحفاظ على اللون فترة أطول، يفضل تجنب الماء والعطور.',
    en: 'It is not original silver. It is a stainless steel fashion accessory with an elegant silver-tone finish. For longer colour life, avoid water and perfume.',
  },
];

const LOYALTY_CODES = ['THANKYOU10', 'VIP15', 'FRIEND10'];

export default function TemplatesView({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  const ar = locale === 'ar';
  const [copied, setCopied] = useState('');

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500">
        {ar
          ? 'رسائل جاهزة بصياغة موحدة للفريق. انسخ الرسالة وأرسلها عبر واتساب أو إنستغرام.'
          : 'Ready messages with unified team wording. Copy and send via WhatsApp or Instagram.'}
      </p>

      <div className="card border-2 border-gold/40">
        <h3 className="mb-1 font-bold">{ar ? 'أكواد خصم الولاء' : 'Loyalty discount codes'}</h3>
        <div className="flex flex-wrap gap-2">
          {LOYALTY_CODES.map((c) => (
            <button key={c} className="badge bg-ink font-mono text-gold" onClick={() => copy(c, c)}>
              {copied === c ? `✓ ${t.copied}` : c}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-700">
          {ar ? 'تابع استخدام الأكواد لحماية هامش الربح.' : 'Track code usage to protect margin.'}
        </p>
      </div>

      {TEMPLATES.map((tpl) => {
        const primary = ar ? tpl.ar : tpl.en;
        const secondary = ar ? tpl.en : tpl.ar;
        return (
          <div key={tpl.key} className="card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold">{ar ? tpl.titleAr : tpl.titleEn}</h3>
                <p className="text-xs text-neutral-400">{ar ? tpl.whenAr : tpl.whenEn}</p>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-luxe p-3 text-sm leading-7">{primary}</p>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-xs font-semibold text-neutral-500">
                {ar ? 'النسخة الإنجليزية' : 'Arabic version'}
              </summary>
              <p dir={ar ? 'ltr' : 'rtl'} className="mt-1 whitespace-pre-wrap rounded-xl bg-luxe p-3 leading-7">
                {secondary}
              </p>
            </details>
            <div className="mt-3 flex gap-2">
              <button className="btn-gold flex-1 py-2 text-sm" onClick={() => copy(primary, tpl.key)}>
                {copied === tpl.key ? `✓ ${t.copied}` : `${t.copy} (${ar ? 'عربي' : 'EN'})`}
              </button>
              <button className="btn-outline flex-1 py-2 text-sm" onClick={() => copy(secondary, tpl.key + '2')}>
                {copied === tpl.key + '2' ? `✓ ${t.copied}` : `${t.copy} (${ar ? 'EN' : 'عربي'})`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
