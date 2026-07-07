'use client';

import { useRef, useState } from 'react';
import { dictionaries, type Locale } from '@/lib/i18n/dict';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  usedEngine?: boolean;
}

export default function BrainChat({ locale, configured }: { locale: Locale; configured: boolean }) {
  const t = dictionaries[locale];
  const ar = locale === 'ar';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const convoId = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = ar
    ? ['بكم أبيع سوارة فضة 925 وزنها 10 جرام؟', 'ما هو أقل سعر آمن لهذا المنتج؟', 'كم ربحي لو بعت بـ 199 درهم؟', 'اكتب لي عرض واتساب للعميل']
    : ['What should I sell a 10g silver 925 bracelet for?', 'What is the minimum safe price?', 'What is my profit if I sell at AED 199?', 'Write a WhatsApp quotation'];

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setBusy(true);
    try {
      const res = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, conversationId: convoId.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: data.message || data.error || 'Error' }]);
      } else {
        convoId.current = data.conversationId;
        setMessages((m) => [...m, { role: 'assistant', content: data.answer, usedEngine: data.usedFormulaEngine }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: String(e) }]);
    }
    setBusy(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      {!configured && (
        <div className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          {ar
            ? 'الذكاء الاصطناعي غير مفعّل. أضف AI_BASE_URL في ملف البيئة (.env) — يعمل مع أي نموذج مفتوح المصدر عبر Ollama أو vLLM أو Groq. الحاسبة تعمل بدون الذكاء الاصطناعي.'
            : 'AI is not configured. Set AI_BASE_URL in .env — works with any open-source model via Ollama, vLLM, or Groq. The calculator works without AI.'}
        </div>
      )}

      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-500">
              {ar ? 'اسأل عن التسعير والربح والخصومات وعروض العملاء:' : 'Ask about pricing, profit, discounts and customer quotes:'}
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {suggestions.map((s) => (
                <button key={s} className="card text-start text-sm hover:border-gold" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-3 text-sm shadow-card ${
            m.role === 'user' ? 'ms-auto bg-ink text-white' : 'bg-white'
          }`}>
            {m.content}
            {m.role === 'assistant' && m.usedEngine && (
              <span className="mt-1 block text-xs text-green-600">✓ {ar ? 'تم التحقق بمحرك التسعير' : 'Validated by the formula engine'}</span>
            )}
          </div>
        ))}
        {busy && <p className="animate-pulse text-sm text-gold-dark">🧠 …</p>}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-16 mt-4 flex gap-2 md:bottom-4">
        <input
          className="input flex-1 bg-white"
          placeholder={t.askBrain}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn-gold px-4" onClick={() => send()} disabled={busy || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
