import AppShell from '@/components/AppShell';
import TemplatesView from '@/components/TemplatesView';
import { getDict, getLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const locale = getLocale();
  const t = getDict(locale);
  return (
    <AppShell title={t.templates}>
      <TemplatesView locale={locale} />
    </AppShell>
  );
}
