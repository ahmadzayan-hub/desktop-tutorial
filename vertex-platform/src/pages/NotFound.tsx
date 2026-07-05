import { Link } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="vertex-card max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-vertex-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{t('errors.notFoundTitle')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('errors.notFoundSubtitle')}</p>
        <Link to="/dashboard" className="vertex-btn-primary mt-6 inline-flex">
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  );
}
