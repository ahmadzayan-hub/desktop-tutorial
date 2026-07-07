'use client';

import { useState } from 'react';

export default function QuoteActions({
  whatsappText,
  instagramText,
  ar,
  phone,
}: {
  whatsappText: string;
  instagramText: string;
  ar: boolean;
  phone?: string | null;
}) {
  const [copied, setCopied] = useState('');

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  const waHref = `https://wa.me/${(phone ?? '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 no-print">
      <a className="btn-gold py-2 text-sm" href={phone ? waHref : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer">
        {ar ? 'إرسال واتساب' : 'Send WhatsApp'}
      </a>
      <button className="btn-outline py-2 text-sm" onClick={() => copy(whatsappText, 'wa')}>
        {copied === 'wa' ? '✓' : ar ? 'نسخ رسالة واتساب' : 'Copy WhatsApp text'}
      </button>
      <button className="btn-outline py-2 text-sm" onClick={() => copy(instagramText, 'ig')}>
        {copied === 'ig' ? '✓' : ar ? 'نسخ رد انستغرام' : 'Copy Instagram reply'}
      </button>
      <button className="btn-outline py-2 text-sm" onClick={() => window.print()}>
        {ar ? 'طباعة / PDF' : 'Print / PDF'}
      </button>
    </div>
  );
}
