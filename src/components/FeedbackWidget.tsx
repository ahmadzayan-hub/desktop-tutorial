"use client";

import { useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

interface Props {
  sessionId: string | null;
  intent: string | null;
  targetModel: string | null;
  rawLength: number;
  finalLength: number;
}

/**
 * Thumbs up / down + optional comment widget shown beneath a generated prompt.
 *
 * Sends to /api/feedback. Failure is swallowed silently — the user always sees
 * a "Thanks!" so the feedback loop never feels broken.
 */
export default function FeedbackWidget({
  sessionId,
  intent,
  targetModel,
  rawLength,
  finalLength
}: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [rating, setRating] = useState<-1 | 0 | 1 | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showComment, setShowComment] = useState(false);

  async function send(value: -1 | 0 | 1, withComment = false) {
    if (busy) return;
    setBusy(true);
    setRating(value);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: value,
          session_id: sessionId && sessionId !== "local" ? sessionId : null,
          intent,
          target_model: targetModel,
          locale,
          raw_length: rawLength,
          final_length: finalLength,
          comment: withComment && comment.trim() ? comment.trim().slice(0, 2000) : null
        })
      });
      setSubmitted(true);
    } catch {
      // Silent — the feedback signal isn't worth a user-facing error.
      setSubmitted(true);
    } finally {
      setBusy(false);
    }
  }

  if (submitted && !showComment) {
    return (
      <div className="mt-3 text-xs text-emerald-700 flex items-center gap-1.5" aria-live="polite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{t("feedback.thanks")}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">{t("feedback.prompt")}</span>
        <button
          type="button"
          onClick={() => send(1)}
          disabled={busy}
          aria-label={t("feedback.up")}
          aria-pressed={rating === 1}
          className={
            "inline-flex items-center justify-center w-8 h-8 rounded-full transition border " +
            (rating === 1
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "border-slate-300 text-slate-600 hover:border-emerald-300 hover:text-emerald-700")
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7l3.05-12.5A4 4 0 0 1 14 6V3a3 3 0 0 1 1 2.88Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => send(-1)}
          disabled={busy}
          aria-label={t("feedback.down")}
          aria-pressed={rating === -1}
          className={
            "inline-flex items-center justify-center w-8 h-8 rounded-full transition border " +
            (rating === -1
              ? "bg-rose-50 border-rose-300 text-rose-700"
              : "border-slate-300 text-slate-600 hover:border-rose-300 hover:text-rose-700")
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2" />
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17l-3.05 12.5A4 4 0 0 1 10 18v3a3 3 0 0 1-1-2.88Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setShowComment((v) => !v)}
          className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
        >
          {showComment ? t("feedback.hide") : t("feedback.add_note")}
        </button>
      </div>

      {showComment && (
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("feedback.placeholder")}
            rows={2}
            maxLength={2000}
            className="w-full text-sm"
          />
          <div className="flex gap-2 sm:flex-col">
            <button
              type="button"
              onClick={() => send(rating ?? 0, true)}
              disabled={busy || (rating === null && !comment.trim())}
              className="btn-primary text-xs sm:w-auto"
            >
              {t("feedback.send")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
