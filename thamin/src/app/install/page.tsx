import type { Metadata } from 'next';
import InstallButton from '@/components/InstallButton';
import { LogoMark } from '@/components/Logo';
import { getLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'تنزيل تطبيق أندرويد | Get the Android App',
  description:
    'ثبت تطبيق ثمين على جهاز أندرويد مباشرة من المتصفح. Install the Thamin pricing app on Android directly from your browser.',
};

export const dynamic = 'force-dynamic';

export default function InstallPage() {
  const locale = getLocale();
  const ar = locale === 'ar';

  const steps = ar
    ? [
        'افتح هذا الموقع من متصفح كروم على جهاز أندرويد.',
        'اضغط زر "تثبيت التطبيق الآن" أدناه، أو اختر "تثبيت التطبيق" من قائمة المتصفح.',
        'ستجد أيقونة ثمين على الشاشة الرئيسية، ويعمل التطبيق بملء الشاشة مثل أي تطبيق من المتجر.',
      ]
    : [
        'Open this site in Chrome on your Android device.',
        'Tap "Install the app now" below, or choose "Install app" from the browser menu.',
        'The Thamin icon appears on your home screen and the app runs full screen like a store app.',
      ];

  const features = ar
    ? ['يعمل بدون إنترنت للصفحات المفتوحة سابقاً', 'إشعارات وتحديثات تلقائية', 'لا يحتاج متجر تطبيقات ولا مساحة كبيرة', 'نفس الحساب ونفس البيانات على كل الأجهزة']
    : ['Works offline for previously opened pages', 'Automatic updates', 'No app store and no large download', 'Same account and data on every device'];

  return (
    <div className="min-h-screen bg-ink px-4 py-10 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 w-fit"><LogoMark size={72} /></div>
          <h1 className="text-2xl font-bold text-gold">{ar ? 'ثمين' : 'Thamin'}</h1>
          <p className="mt-1 text-white/70">
            {ar ? 'ثبت تطبيق التسعير الذكي على جهازك' : 'Install the smart pricing app on your device'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 text-ink shadow-card">
          <InstallButton ar={ar} />
          <ol className="mt-5 list-inside list-decimal space-y-2 text-sm leading-7 text-neutral-700">
            {steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </div>

        <ul className="grid grid-cols-2 gap-2 text-sm">
          {features.map((f) => (
            <li key={f} className="rounded-xl border border-gold/40 p-3 text-white/85">✓ {f}</li>
          ))}
        </ul>

        <p className="text-center text-xs text-white/50">
          {ar
            ? 'لإصدار متجر Google Play يمكن تغليف التطبيق بتقنية TWA، والتعليمات موجودة في ملف docs/ANDROID.md.'
            : 'For a Google Play release the app can be wrapped as a TWA; see docs/ANDROID.md for instructions.'}
        </p>
        <p className="text-center">
          <a href="/login" className="text-sm font-semibold text-gold underline-offset-4 hover:underline">
            {ar ? 'الدخول إلى المنصة' : 'Open the platform'}
          </a>
        </p>
      </div>
    </div>
  );
}
