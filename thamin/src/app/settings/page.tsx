import AppShell from '@/components/AppShell';
import SettingsForm from '@/components/SettingsForm';
import PasswordForm from '@/components/PasswordForm';
import { prisma } from '@/lib/db';
import { getDict, getLocale } from '@/lib/i18n';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const locale = getLocale();
  const t = getDict(locale);
  const session = getSession();
  const rules = await prisma.businessRules.findUnique({ where: { id: 'default' } });

  return (
    <AppShell title={t.settings}>
      <div className="space-y-4">
        <PasswordForm locale={locale} />
        {session?.role !== 'ADMIN' ? (
          <p className="card text-sm text-neutral-500">
            {locale === 'ar' ? 'إعدادات قواعد العمل متاحة للمدير فقط.' : 'Business rules can only be edited by an Admin.'}
          </p>
        ) : (
          <SettingsForm locale={locale} rules={JSON.parse(JSON.stringify(rules))} />
        )}
      </div>
    </AppShell>
  );
}
