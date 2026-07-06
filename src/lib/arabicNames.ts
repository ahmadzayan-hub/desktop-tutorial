/**
 * Arabic name spelling assistant.
 * Never blind-transliterates blindly for unknown names — it prefers a curated
 * map of common UAE/GCC names and only falls back to a best-effort phonetic
 * mapping, clearly flagged so a human can confirm. Mirrors the guardrail used
 * in the sibling Beyond Style console.
 */

const NAME_MAP: Record<string, string> = {
  mohammed: "محمد", mohamed: "محمد", muhammad: "محمد", ahmed: "أحمد", ahmad: "أحمد",
  ali: "علي", omar: "عمر", omer: "عمر", khalid: "خالد", khaled: "خالد",
  hamdan: "حمدان", saeed: "سعيد", rashid: "راشد", sultan: "سلطان", majid: "ماجد",
  yousef: "يوسف", yusuf: "يوسف", ibrahim: "إبراهيم", hassan: "حسن", hussain: "حسين",
  abdullah: "عبدالله", abdulla: "عبدالله", zayed: "زايد", mansour: "منصور",
  fatima: "فاطمة", aisha: "عائشة", aysha: "عائشة", maryam: "مريم", mariam: "مريم",
  sara: "سارة", sarah: "سارة", noor: "نور", nora: "نورة", noura: "نورة",
  hessa: "حصة", shaikha: "شيخة", shamma: "شمّة", mouza: "موزة", latifa: "لطيفة",
  rehab: "رحاب", huda: "هدى", salma: "سلمى", lina: "لينا", layla: "ليلى", leila: "ليلى",
  amna: "آمنة", reem: "ريم", dana: "دانة", jana: "جنى", mira: "ميرة",
  habibi: "حبيبي", habibti: "حبيبتي", mama: "ماما", baba: "بابا",
};

const DIGRAPHS: Array<[RegExp, string]> = [
  [/sh/g, "ش"], [/ch/g, "تش"], [/th/g, "ث"], [/kh/g, "خ"], [/gh/g, "غ"],
  [/ph/g, "ف"], [/oo/g, "و"], [/ee/g, "ي"], [/aa/g, "ا"],
];
const LETTERS: Record<string, string> = {
  a: "ا", b: "ب", c: "ك", d: "د", e: "ي", f: "ف", g: "ج", h: "ه", i: "ي",
  j: "ج", k: "ك", l: "ل", m: "م", n: "ن", o: "و", p: "ب", q: "ق", r: "ر",
  s: "س", t: "ت", u: "و", v: "ف", w: "و", x: "كس", y: "ي", z: "ز",
};

export interface NameSuggestion {
  arabic: string;
  confident: boolean;
}

export function suggestArabicName(input: string): NameSuggestion | null {
  const clean = input.trim().toLowerCase();
  if (!clean) return null;

  // Multi-word: resolve each token, keep confidence only if all are known.
  const tokens = clean.split(/\s+/);
  const resolved = tokens.map((tok) => {
    if (NAME_MAP[tok]) return { arabic: NAME_MAP[tok], confident: true };
    let s = tok;
    for (const [re, rep] of DIGRAPHS) s = s.replace(re, rep);
    const out = s.replace(/[a-z]/g, (ch) => LETTERS[ch] ?? ch);
    return { arabic: out, confident: false };
  });

  return {
    arabic: resolved.map((r) => r.arabic).join(" "),
    confident: resolved.every((r) => r.confident),
  };
}
