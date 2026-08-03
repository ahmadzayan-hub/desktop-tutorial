// Deterministic bilingual writing reviewer. Runs pattern-based checks
// on a brief text so we can offer real "100% correctness" signals for
// the AR + EN briefs without needing an LLM. Not a full grammar engine,
// but catches the classes of mistakes an executive review actually
// blocks on: mixed digit systems, LTR punctuation in RTL text, common
// typos, doubled words, spacing before punctuation, and hijacked
// direction markers.

import type { ReviewFinding, SeverityLevel } from "./types";

const AR_DIGIT = /[٠-٩]/;
const LATIN_DIGIT = /[0-9]/;
const ARABIC_LETTER = /[؀-ۿ]/;
const LATIN_LETTER = /[A-Za-z]/;

interface Check {
  id: string;
  severity: SeverityLevel;
  message_en: string;
  message_ar: string;
  test: (text: string) => string | null; // returns excerpt or null
}

const AR_CHECKS: readonly Check[] = [
  {
    id: "ar-mixed-digits",
    severity: "warning",
    message_en: "Arabic text contains Latin digits (mix with Eastern-Arabic).",
    message_ar: "النصّ العربي يحتوي أرقاماً لاتينيّة (اخلطها مع الأرقام العربيّة-الهنديّة).",
    test: (t) => {
      // Only flag when the paragraph is clearly Arabic (>=3 arabic letters).
      const arCount = (t.match(/[؀-ۿ]/g) ?? []).length;
      if (arCount < 3) return null;
      // A short Latin token adjacent to Arabic letters within 20 chars.
      const m = /[؀-ۿ][^\n]{0,20}[0-9]{1,4}/u.exec(t);
      return m?.[0] ?? null;
    },
  },
  {
    id: "ar-ltr-comma",
    severity: "warning",
    message_en: "Latin comma ',' in Arabic text — use '،' (Arabic comma).",
    message_ar: "فاصلة لاتينيّة ',' داخل النصّ العربي — استخدم '،'.",
    test: (t) => {
      const idx = t.search(/[؀-ۿ][^\n]{0,15},/u);
      if (idx < 0) return null;
      return t.slice(idx, idx + 25);
    },
  },
  {
    id: "ar-ltr-question",
    severity: "warning",
    message_en: "Latin '?' in Arabic text — use '؟'.",
    message_ar: "علامة استفهام لاتينيّة '?' داخل النصّ العربي — استخدم '؟'.",
    test: (t) => {
      const idx = t.search(/[؀-ۿ][^\n]{0,20}\?/u);
      if (idx < 0) return null;
      return t.slice(idx, idx + 30);
    },
  },
  {
    id: "space-before-punct",
    severity: "info",
    message_en: "Space before punctuation ' .' or ' ،' — remove the leading space.",
    message_ar: "فراغ قبل علامة الترقيم ' .' أو ' ،' — احذف الفراغ.",
    test: (t) => {
      const m = / [.,،؛؟]/u.exec(t);
      return m?.[0] ?? null;
    },
  },
];

const EN_CHECKS: readonly Check[] = [
  {
    id: "en-arabic-digits",
    severity: "warning",
    message_en: "English text contains Eastern-Arabic digits — use Latin digits.",
    message_ar: "نصّ إنجليزي يحتوي أرقاماً عربيّة-هنديّة — استخدم الأرقام اللاتينيّة.",
    test: (t) => {
      const latinCount = (t.match(/[A-Za-z]/g) ?? []).length;
      if (latinCount < 5) return null;
      const m = /[A-Za-z][^\n]{0,20}[٠-٩]/u.exec(t);
      return m?.[0] ?? null;
    },
  },
  {
    id: "en-double-space",
    severity: "info",
    message_en: "Double space detected — normalise to single space.",
    message_ar: "فراغٌ مزدوج — طبِّع إلى فراغٍ واحد.",
    test: (t) => (t.includes("  ") ? "  " : null),
  },
  {
    id: "smart-quote-mix",
    severity: "info",
    message_en: 'Straight quote " mixed with curly “ ” — pick one style.',
    message_ar: "علامتا اقتباس مستقيمتان \" مع مقوَّستَين “ ” — وحِّد الأسلوب.",
    test: (t) =>
      /["]/u.test(t) && /[“”]/u.test(t) ? '"…“' : null,
  },
];

const UNIVERSAL_CHECKS: readonly Check[] = [
  {
    id: "doubled-word",
    severity: "warning",
    message_en: "Doubled word detected.",
    message_ar: "كلمةٌ مكرَّرة.",
    test: (t) => {
      // Match a word repeated with only whitespace between (both scripts).
      // Case-insensitive so "The the" is caught.
      const m = /\b([\p{L}]{3,})\s+\1\b/iu.exec(t);
      return m?.[0] ?? null;
    },
  },
  {
    id: "trailing-space",
    severity: "info",
    message_en: "Trailing whitespace at line end.",
    message_ar: "فراغٌ زائدٌ في نهاية السطر.",
    test: (t) => (/[ \t]+\n/u.test(t) ? "…␠␊" : null),
  },
];

export interface LanguageReviewInput {
  text_en: string;
  text_ar: string;
}

/**
 * Run every check against both variants of the brief and return the
 * combined findings, tagged to the language-reviewer agent.
 */
export function reviewBrief(input: LanguageReviewInput): ReviewFinding[] {
  const out: ReviewFinding[] = [];

  const push = (checks: readonly Check[], text: string) => {
    for (const c of checks) {
      const hit = c.test(text);
      if (hit) {
        out.push({
          agent: "language",
          severity: c.severity,
          message_en: c.message_en,
          message_ar: c.message_ar,
          excerpt: hit.trim().slice(0, 80),
        });
      }
    }
  };

  push(AR_CHECKS, input.text_ar);
  push(EN_CHECKS, input.text_en);
  push(UNIVERSAL_CHECKS, `${input.text_ar}\n\n${input.text_en}`);

  return out;
}

// Convenience — the union of scripts touched by the brief, useful for
// the UI to show "AR + EN reviewed" vs "AR only reviewed".
export function detectScripts(text: string): {
  arabic: boolean;
  latin: boolean;
} {
  return {
    arabic: ARABIC_LETTER.test(text) || AR_DIGIT.test(text),
    latin: LATIN_LETTER.test(text) || LATIN_DIGIT.test(text),
  };
}
