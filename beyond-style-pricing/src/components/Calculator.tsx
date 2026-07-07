'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { dictionaries, type Locale } from '@/lib/i18n/dict';
import type { PricingResult } from '@/lib/pricing/types';
import PriceResult from './PriceResult';

interface MaterialOpt {
  id: string;
  name: string;
  category: string;
  unit: string;
  ratePerUnit: number;
  updatedAt: string;
  source: string;
}

interface Props {
  locale: Locale;
  isAdmin: boolean;
  materials: MaterialOpt[];
  channels: { key: string; name: string }[];
  defaults: { targetMarginPct: number; minMarginPct: number; vatMode: string; rateMaxAgeHours: number };
}

type Mode = 'quick' | 'advanced' | 'photo';

const PRODUCT_TYPES = ['NECKLACE', 'BRACELET', 'RING', 'EARRINGS', 'PENDANT', 'CHAIN', 'SET', 'OTHER'];

const emptyForm = {
  productType: 'NECKLACE',
  materialId: '',
  weightGrams: '',
  supplierCost: '',
  supplierCurrency: 'AED',
  exchangeRate: '1',
  makingCharge: '',
  platingCost: '',
  chainCost: '',
  claspCost: '',
  pendantCost: '',
  stoneCost: '',
  engravingCost: '',
  customizationCost: '',
  packagingCost: '',
  giftBoxCost: '',
  deliveryCost: '',
  remoteArea: false,
  paymentMethod: 'CARD',
  paymentFeePct: '',
  marketingCost: '',
  operationsCost: '',
  otherCosts: '',
  vatMode: 'EXCLUSIVE',
  targetMarginPct: '',
  channelKey: '',
  discountPct: '',
  sellingPriceOverride: '',
  adminOverride: false,
  overrideReason: '',
};

export default function Calculator({ locale, isAdmin, materials, channels, defaults }: Props) {
  const t = dictionaries[locale];
  const params = useSearchParams();
  const initialMode: Mode = params.get('mode') === 'photo' ? 'photo' : 'quick';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({ ...emptyForm, targetMarginPct: String(defaults.targetMarginPct) });
  const [result, setResult] = useState<PricingResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // AI photo state
  const [photo, setPhoto] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const material = useMemo(() => materials.find((m) => m.id === form.materialId), [form.materialId, materials]);
  const gramBased = material && material.unit === 'gram' && (material.category === 'GOLD' || material.category === 'SILVER');
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === '' ? undefined : Number(v));

  async function calculate() {
    setBusy(true);
    setError('');
    setResult(null);
    const input: Record<string, unknown> = {
      vatMode: form.vatMode,
      targetMarginPct: num(form.targetMarginPct),
      supplierCost: num(form.supplierCost),
      exchangeRate: num(form.exchangeRate) ?? 1,
      supplierCurrency: form.supplierCurrency,
      remoteArea: form.remoteArea,
      paymentMethod: form.paymentMethod,
      paymentFeePct: num(form.paymentFeePct),
      deliveryCost: num(form.deliveryCost),
      discountPct: num(form.discountPct),
      sellingPriceOverride: num(form.sellingPriceOverride),
      adminOverride: isAdmin && form.adminOverride,
    };
    if (material) {
      input.materialCategory = material.category;
      input.materialRateSource = material.source;
      input.materialRateUpdatedAt = material.updatedAt;
      if (gramBased) {
        input.materialRatePerGram = material.ratePerUnit;
        input.weightGrams = num(form.weightGrams);
      } else if (material.unit === 'piece' && form.supplierCost === '') {
        // piece-priced material with no supplier quote: use library rate as supplier cost
        input.supplierCost = material.ratePerUnit;
      }
    }
    if (mode !== 'quick') {
      Object.assign(input, {
        makingCharge: num(form.makingCharge),
        platingCost: num(form.platingCost),
        chainCost: num(form.chainCost),
        claspCost: num(form.claspCost),
        pendantCost: num(form.pendantCost),
        stoneCost: num(form.stoneCost),
        engravingCost: num(form.engravingCost),
        customizationCost: num(form.customizationCost),
        packagingCost: num(form.packagingCost),
        giftBoxCost: num(form.giftBoxCost),
        marketingCost: num(form.marketingCost),
        operationsCost: num(form.operationsCost),
        otherCosts: num(form.otherCosts),
      });
    }
    const res = await fetch('/api/price', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: mode === 'photo' ? 'AI_PHOTO' : mode === 'advanced' ? 'ADVANCED' : 'QUICK',
        channelKey: form.channelKey || undefined,
        overrideReason: form.overrideReason || undefined,
        input,
      }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Calculation failed');
      return;
    }
    setResult(data.result);
  }

  async function analyzePhoto(file: File) {
    setAiError('');
    setEstimate(null);
    const dataUri: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    setPhoto(dataUri);
    setAiBusy(true);
    const res = await fetch('/api/ai/vision', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image: dataUri }),
    });
    setAiBusy(false);
    const data = await res.json();
    if (!res.ok) {
      setAiError(data.message || data.error || 'Analysis failed');
      return;
    }
    const est = data.estimate;
    setEstimate(est);
    // prefill costing fields from AI suggestion — user confirms before pricing
    setForm((f) => ({
      ...f,
      productType: est.productType ?? f.productType,
      makingCharge: est.suggestedCostingFields?.makingCharge?.toString() ?? f.makingCharge,
      chainCost: est.suggestedCostingFields?.chainCost?.toString() ?? f.chainCost,
      claspCost: est.suggestedCostingFields?.claspCost?.toString() ?? f.claspCost,
      stoneCost: est.suggestedCostingFields?.stoneCost?.toString() ?? f.stoneCost,
      packagingCost: est.suggestedCostingFields?.packagingCost?.toString() ?? f.packagingCost,
    }));
  }

  const modes: { key: Mode; label: string }[] = [
    { key: 'quick', label: t.quickQuote },
    { key: 'advanced', label: t.advancedCosting },
    { key: 'photo', label: t.aiPhotoEstimate },
  ];

  // plain render function (not a component) so inputs keep focus across renders
  const field = (k: keyof typeof emptyForm, label: string) => (
    <div key={k}>
      <label className="label">{label}</label>
      <input
        className="input num"
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        value={String(form[k] ?? '')}
        onChange={(e) => set(k, e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* mode tabs */}
      <div className="flex gap-1 rounded-2xl bg-white p-1 shadow-card">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
              mode === m.key ? 'bg-ink text-gold' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* AI photo panel */}
      {mode === 'photo' && (
        <div className="card space-y-3">
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t.aiDisclaimer}</p>
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => e.target.files?.[0] && analyzePhoto(e.target.files[0])}
          />
          {photo && <img src={photo} alt="product" className="mx-auto max-h-56 rounded-xl object-contain" />}
          {aiBusy && <p className="animate-pulse text-center text-sm text-gold-dark">{t.analyzePhoto}…</p>}
          {aiError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{aiError}</p>}
          {estimate && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-ink text-gold">{estimate.productType}</span>
                <span className="badge bg-neutral-100 text-neutral-700">{estimate.visibleAppearance}</span>
                <span
                  className={`badge ${
                    estimate.confidence === 'HIGH'
                      ? 'bg-green-100 text-green-700'
                      : estimate.confidence === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {t.confidence}: {estimate.confidence === 'HIGH' ? t.high : estimate.confidence === 'MEDIUM' ? t.medium : t.low}
                </span>
              </div>
              <p className="font-semibold">{locale === 'ar' ? estimate.suggestedTitleAr : estimate.suggestedTitleEn}</p>
              <p className="text-neutral-600">{locale === 'ar' ? estimate.suggestedDescriptionAr : estimate.suggestedDescriptionEn}</p>
              <p className="num text-neutral-600">
                {locale === 'ar' ? 'نطاق سعر تقريبي للعميل:' : 'Indicative customer range:'}{' '}
                AED {estimate.customerPriceRangeAed?.min}–{estimate.customerPriceRangeAed?.max}
              </p>
              {estimate.confidence !== 'HIGH' && (
                <p className="rounded-lg bg-amber-50 p-2 text-amber-800">
                  {locale === 'ar'
                    ? 'الثقة متوسطة/منخفضة — تلزم مراجعة بشرية قبل إرسال عرض للعميل.'
                    : 'Medium/low confidence — human review required before quoting a customer.'}
                </p>
              )}
              <div>
                <p className="font-semibold text-red-700">{locale === 'ar' ? 'لا يمكن تأكيده من الصورة:' : 'Cannot be confirmed from photo:'}</p>
                <ul className="list-inside list-disc text-neutral-600">
                  {estimate.cannotConfirmFromPhoto?.map((x: string) => <li key={x}>{x}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gold-dark">{locale === 'ar' ? 'أدخل البيانات الناقصة أدناه ثم احسب:' : 'Enter the missing data below, then calculate:'}</p>
                <ul className="list-inside list-disc text-neutral-600">
                  {estimate.missingInputsToAskUser?.map((x: string) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* form */}
      <div className="card grid grid-cols-2 gap-3 md:grid-cols-3">
        <div>
          <label className="label">{t.productType}</label>
          <select className="input" value={form.productType} onChange={(e) => set('productType', e.target.value)}>
            {PRODUCT_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.material}</label>
          <select className="input" value={form.materialId} onChange={(e) => set('materialId', e.target.value)}>
            <option value="">—</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.ratePerUnit} AED/{m.unit})
              </option>
            ))}
          </select>
        </div>
        {gramBased && field('weightGrams', t.weightGrams)}
        {field('supplierCost', t.supplierCost)}
        {mode !== 'quick' && (
          <div>
            <label className="label">{t.exchangeRate}</label>
            <input className="input num" type="number" min={0} step="any" value={form.exchangeRate} onChange={(e) => set('exchangeRate', e.target.value)} />
          </div>
        )}
        <div>
          <label className="label">{t.deliveryArea}</label>
          <select className="input" value={form.remoteArea ? '1' : '0'} onChange={(e) => set('remoteArea', e.target.value === '1')}>
            <option value="0">{t.standardUae}</option>
            <option value="1">{t.remoteArea}</option>
          </select>
        </div>
        {field('targetMarginPct', t.targetMargin)}
        <div>
          <label className="label">{t.vatMode}</label>
          <select className="input" value={form.vatMode} onChange={(e) => set('vatMode', e.target.value)}>
            <option value="EXCLUSIVE">{t.vatExclusive}</option>
            <option value="INCLUSIVE">{t.vatInclusive}</option>
            <option value="NONE">{t.vatNone}</option>
          </select>
        </div>
        <div>
          <label className="label">{t.paymentMethod}</label>
          <select className="input" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
            {['CARD', 'COD', 'ZIINA', 'LINK', 'CASH'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.channel}</label>
          <select className="input" value={form.channelKey} onChange={(e) => set('channelKey', e.target.value)}>
            <option value="">—</option>
            {channels.map((c) => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </div>

        {mode !== 'quick' && (
          <>
            {field('makingCharge', t.makingCharge)}
            {field('platingCost', t.platingCost)}
            {field('chainCost', t.chainCost)}
            {field('claspCost', t.claspCost)}
            {field('pendantCost', t.pendantCost)}
            {field('stoneCost', t.stoneCost)}
            {field('engravingCost', t.engravingCost)}
            {field('customizationCost', t.customizationCost)}
            {field('packagingCost', t.packagingCost)}
            {field('giftBoxCost', t.giftBoxCost)}
            {field('deliveryCost', t.deliveryCost)}
            {field('paymentFeePct', t.paymentFee)}
            {field('marketingCost', t.marketingCost)}
            {field('operationsCost', t.operationsCost)}
            {field('otherCosts', t.otherCosts)}
            {field('discountPct', t.discountPct)}
            {field('sellingPriceOverride', t.sellAtPrice)}
          </>
        )}
      </div>

      {isAdmin && (
        <div className="card flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.adminOverride} onChange={(e) => set('adminOverride', e.target.checked)} />
            {locale === 'ar' ? 'تجاوز المدير (البيع تحت التكلفة)' : 'Admin override (allow below cost)'}
          </label>
          {form.adminOverride && (
            <input
              className="input flex-1"
              placeholder={locale === 'ar' ? 'سبب التجاوز (إلزامي)' : 'Override reason (required)'}
              value={form.overrideReason}
              onChange={(e) => set('overrideReason', e.target.value)}
            />
          )}
        </div>
      )}

      <button className="btn-gold w-full text-lg" onClick={calculate} disabled={busy || (form.adminOverride && !form.overrideReason)}>
        {busy ? '…' : t.calculatePrice}
      </button>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

      {result && <PriceResult result={result} locale={locale} productName={form.productType} />}
    </div>
  );
}
