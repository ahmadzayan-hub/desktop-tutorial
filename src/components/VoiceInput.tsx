"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface Props {
  onTranscript: (text: string, append: boolean) => void;
  className?: string;
}

/**
 * Voice input that records continuously until the user explicitly stops.
 *
 * The Web Speech API auto-ends after a silence window (especially on mobile
 * Chrome) — we transparently restart recognition while the user is still in
 * "listening" mode so a long pause doesn't end the session prematurely.
 */
export default function VoiceInput({ onTranscript, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // True only when the user has hit "stop". Auto-end events check this to
  // decide between restart (long-record mode) and a real stop.
  const userStoppedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = locale === "ar" ? "ar-SA" : "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          chunk += e.results[i][0].transcript;
        }
      }
      if (chunk) onTranscript(chunk, true);
    };

    rec.onerror = (e) => {
      // "no-speech" and "audio-capture" are recoverable on mobile — keep going
      // unless the user has stopped explicitly.
      if (
        !userStoppedRef.current &&
        (e.error === "no-speech" || e.error === "audio-capture" || e.error === "aborted")
      ) {
        return;
      }
      setError(e.error);
      userStoppedRef.current = true;
      setListening(false);
    };

    rec.onend = () => {
      // Auto-restart unless the user explicitly stopped — this is the key
      // change that lets recording run for as long as the user wants.
      if (!userStoppedRef.current) {
        try {
          rec.start();
          return;
        } catch {
          // Some browsers throw "already started"; fall through to mark
          // listening = false.
        }
      }
      setListening(false);
      startedAtRef.current = null;
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    recRef.current = rec;
    return () => {
      userStoppedRef.current = true;
      try { rec.stop(); } catch { /* ignore */ }
      recRef.current = null;
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [locale, onTranscript]);

  function start() {
    const rec = recRef.current;
    if (!rec) return;
    setError(null);
    userStoppedRef.current = false;
    rec.lang = locale === "ar" ? "ar-SA" : "en-US";
    try {
      rec.start();
      setListening(true);
      startedAtRef.current = Date.now();
      setElapsed(0);
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = setInterval(() => {
        if (startedAtRef.current) {
          setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }
      }, 1000);
    } catch (e) {
      setError(String(e));
    }
  }

  function stop() {
    const rec = recRef.current;
    userStoppedRef.current = true;
    setListening(false);
    if (rec) {
      try { rec.stop(); } catch { /* ignore */ }
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    startedAtRef.current = null;
  }

  function toggle() {
    if (listening) stop();
    else start();
  }

  if (!supported) {
    return (
      <span className={`text-xs text-slate-500 ${className ?? ""}`} title={t("voice.unsupported")}>
        🎤 —
      </span>
    );
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? t("voice.stop") : t("voice.start")}
        className={
          "relative inline-flex items-center justify-center w-10 h-10 rounded-full transition shadow-sm " +
          (listening
            ? "bg-rose-600 text-white shadow-rose-300/50"
            : "bg-white border border-slate-300 text-slate-700 hover:border-brand-400 hover:text-brand-700")
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {listening ? (
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            <>
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </>
          )}
        </svg>
        {listening && (
          <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/40" />
        )}
      </button>
      {listening && (
        <span className="text-xs text-rose-600 font-medium tabular-nums" aria-live="polite">
          ● {mm}:{ss} · {t("voice.listening")}
        </span>
      )}
      {error && !listening && (
        <span className="text-xs text-rose-700">{t("voice.error", { detail: error })}</span>
      )}
    </div>
  );
}
