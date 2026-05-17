import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function Dashboard() {
  const { t } = useLanguage();
  const { profile, user } = useAuth();
  const greeting = profile?.full_name || user?.email || '';

  return (
    <AppShell pageTitle={t('dashboard.title')}>
      <section aria-labelledby="dashboard-heading" className="space-y-4">
        <h2 id="dashboard-heading" className="text-2xl font-bold text-slate-900">
          {t('dashboard.title')}
        </h2>
        {greeting && (
          <p className="text-sm text-slate-600">{t('auth.welcome')}, {greeting}.</p>
        )}
        <div className="vertex-card p-6">
          <p className="text-slate-600">{t('dashboard.placeholder')}</p>
        </div>
      </section>
    </AppShell>
  );
}
