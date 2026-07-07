import AppShell from '@/components/AppShell';
import BrainChat from '@/components/BrainChat';
import { getDict, getLocale } from '@/lib/i18n';
import { aiConfigured } from '@/lib/ai/client';

export const dynamic = 'force-dynamic';

export default function BrainPage() {
  const locale = getLocale();
  const t = getDict(locale);
  return (
    <AppShell title={t.brain}>
      <BrainChat locale={locale} configured={aiConfigured()} />
    </AppShell>
  );
}
