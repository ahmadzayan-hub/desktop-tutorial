import type { Lang } from "@/i18n/I18nContext";
import { suggestArabicName, type NameSuggestion } from "./arabicNames";
import { autoCropSquare, autoEnhance } from "./imageQuality";
import { EVENT_PACKAGES } from "./catalog";

/**
 * AI feature layer.
 *
 * Every feature is exposed behind a small, typed interface so the local
 * (offline, deterministic) implementation used here can be swapped for a real
 * provider call (OpenAI / Anthropic / Gemini / Firefly) without touching the
 * UI. Set VITE_AI_ENDPOINT to route generation server-side; otherwise the
 * built-in templates/heuristics run so the whole flow works out of the box.
 */
export const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT as string | undefined;

// ---- 1. Arabic name spelling assistant -----------------------------------
export function arabicNameAssist(input: string): NameSuggestion | null {
  return suggestArabicName(input);
}

// ---- 2. Gift message generator -------------------------------------------
export type Tone = "warm" | "funny" | "formal" | "romantic";

const MESSAGE_BANK: Record<Tone, { en: string[]; ar: string[] }> = {
  warm: {
    en: [
      "Every good memory tastes a little sweeter with you. Thank you for being you.",
      "A small cup, a big feeling. You mean the world to me.",
      "Here's to the little moments that matter most. With all my love.",
    ],
    ar: [
      "كل ذكرى جميلة تصير أحلى معك. شكراً لأنك أنت.",
      "كوب صغير وإحساس كبير، أنت الدنيا كلها بالنسبة لي.",
      "نخب اللحظات الصغيرة اللي تسوى الكثير. بكل حبّي.",
    ],
  },
  funny: {
    en: [
      "You're brew-tiful and I'm not just saying that because I need coffee.",
      "We go together like coffee and mornings. Slightly chaotic, totally essential.",
      "Warning: contents may cause excessive smiling. Enjoy!",
    ],
    ar: [
      "أنت زود الحلا، ومو بس لأني محتاج قهوة الصبح.",
      "احنا مثل القهوة والصباح، فوضى بسيطة، بس ضروريين.",
      "تحذير: المحتوى يسبّب ابتسامة زايدة. بالعافية!",
    ],
  },
  formal: {
    en: [
      "With sincere appreciation for your dedication and hard work. Thank you.",
      "A token of our gratitude. Your contribution does not go unnoticed.",
      "Wishing you continued success. With our warmest regards.",
    ],
    ar: [
      "مع خالص التقدير لتفانيك وجهدك. شكراً لك.",
      "لفتة امتنان، إسهامك محلّ تقدير دائم.",
      "نتمنى لك دوام التوفيق. مع أطيب التحيات.",
    ],
  },
  romantic: {
    en: [
      "You're my favourite moment of every single day.",
      "Of all the cups in all the cafés, I'd choose yours every time.",
      "My heart is warmer with you in it. Always.",
    ],
    ar: [
      "أنت أحلى لحظة في يومي كل يوم.",
      "من بين كل الأكواب في كل المقاهي، أختارك أنت دائماً.",
      "قلبي أدفأ وأنت فيه. دائماً.",
    ],
  },
};

export function generateGiftMessage(tone: Tone, lang: Lang, seed = 0): string {
  const bank = MESSAGE_BANK[tone][lang];
  return bank[seed % bank.length];
}

// ---- 3. Event package recommender ----------------------------------------
export function recommendEventPackage(guests: number): (typeof EVENT_PACKAGES)[number] {
  if (guests <= 150) return EVENT_PACKAGES[0];
  if (guests <= 350) return EVENT_PACKAGES[1];
  return EVENT_PACKAGES[2];
}

// ---- 4. Corporate proposal generator -------------------------------------
export interface ProposalInput {
  company: string;
  eventType: string;
  guests: number;
  date: string;
  location: string;
}

export function generateCorporateProposal(input: ProposalInput, lang: Lang): string {
  const pkg = recommendEventPackage(input.guests);
  if (lang === "ar") {
    return `يسعد Beyond Coffee Moments تقديم تجربة قهوة راقية لـ ${input.company} بمناسبة ${input.eventType} في ${input.location} بتاريخ ${input.date}. لعدد ${input.guests} ضيفاً، نوصي بباقة "${pkg.name.ar}" التي تشمل طباعة قهوة سيلفي مباشرة وأكواباً تحمل هويتكم وفريق باريستا محترف. نلتزم بتجربة سلسة تعزّز حضور علامتكم وتترك انطباعاً لا يُنسى لدى ضيوفكم.`;
  }
  return `Beyond Coffee Moments is delighted to propose a premium coffee experience for ${input.company} at your ${input.eventType} in ${input.location} on ${input.date}. For ${input.guests} guests, we recommend the "${pkg.name.en}" package: live selfie-coffee printing, branded cups and a professional barista team. We commit to a seamless activation that elevates your brand presence and leaves a memorable impression on every guest.`;
}

// ---- 5. Image cleanup + auto-crop (client-side; swappable) ----------------
export function aiImageCleanup(img: HTMLImageElement): string {
  return autoEnhance(img);
}
export function aiAutoCrop(img: HTMLImageElement): string {
  return autoCropSquare(img);
}

// ---- 6. Image moderation before checkout ---------------------------------
export type ModerationResult = { ok: true } | { ok: false; reason: string };

/**
 * Placeholder moderation. Client-side we can only do trivial checks (e.g. file
 * present, decodable). Real moderation must run server-side before production
 * (see AI_ENDPOINT). We fail-open here but keep a clear seam.
 */
export async function moderateImage(dataUrl: string): Promise<ModerationResult> {
  if (AI_ENDPOINT) {
    try {
      const res = await fetch(`${AI_ENDPOINT}/moderate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (res.ok) return (await res.json()) as ModerationResult;
    } catch {
      /* fall through to fail-open */
    }
  }
  return { ok: true };
}
