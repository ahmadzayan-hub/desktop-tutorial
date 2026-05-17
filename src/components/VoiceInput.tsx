"use client";

/**
 * VoiceInput — MediaRecorder-based recording state machine.
 *
 * State machine:
 *   idle ──(click mic)──► requesting ──(permission granted)──► recording
 *   recording ──(click stop)──► stopping ──(onstop fires)──► processing
 *   processing ──(API ok)──► completed
 *   processing ──(API error)──► error
 *   completed / error ──(click mic again)──► requesting
 *
 * Key guarantees:
 *   • Audio is NEVER sent for transcription while the user is still recording.
 *   • All chunks are collected in an array; combined into one Blob only after
 *     MediaRecorder.onstop fires (i.e. after Stop is pressed).
 *   • An isProcessingRef flag prevents duplicate submissions if Stop is
 *     pressed or the component re-renders during processing.
 *   • Silence detection is NOT used as a stop trigger. Manual Stop is the
 *     only way to end a recording session.
 *   • onTranscript is called exactly once — with the final transcript and
 *     isFinal=true — after the server returns the result.
 *   • Mobile Chrome: start(1000) timeslice ensures ondataavailable fires
 *     regularly even before the stream ends.
 */

import { useEffect, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";
import {
  labelFor,
  listFor,
  loadPreferred,
  savePreferred,
  type VoiceLocale,
} from "@/lib/voice-locales";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  /** Called once with the final transcript after processing completes. */
  onTranscript: (text: string, isFinal: boolean) => void;
  /**
   * Kept for interface compatibility with Workspace. In this implementation
   * it is NEVER auto-fired — the user must press Stop themselves, then
   * manually trigger analysis. Pass undefined to make that explicit.
   */
  onAutoSubmit?: () => void;
  /** Called when the user wants to type instead of using voice. */
  onTypeInstead?: () => void;
  className?: string;
}

/**
 * Recording state machine states.
 *
 * idle        – waiting for the user to press the microphone button
 * requesting  – asking the browser for microphone permission
 * recording   – actively recording; collecting audio chunks
 * stopping    – Stop pressed; waiting for MediaRecorder.onstop to fire
 * processing  – sending the audio blob to the transcription API
 * completed   – transcript received; shown in a popover
 * error       – something went wrong; user can retry
 */
type RecState =
  | "idle"
  | "requesting"
  | "recording"
  | "stopping"
  | "processing"
  | "completed"
  | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pick the best supported audio MIME type for this browser. */
function getBestMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/mpeg",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

/** Format elapsed seconds as MM:SS. */
function formatElapsed(secs: number): string {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceInput({
  onTranscript,
  onTypeInstead,
  className,
}: Props) {
  const t = useT();
  const { locale } = useI18n();

  // ── State ──────────────────────────────────────────────────────────────────
  const [recState, setRecState] = useState<RecState>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);           // 0..1 RMS for the level meter
  const [voiceLocale, setVoiceLocale] = useState<VoiceLocale | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [transcript, setTranscript] = useState("");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  /** All audio chunks collected during recording. Cleared before each new session. */
  const chunksRef = useRef<Blob[]>([]);
  /** Guards against duplicate submissions (e.g. rapid Stop clicks). */
  const isProcessingRef = useRef(false);

  // Web Audio chain for the level meter visualisation
  const streamRef    = useRef<MediaStream | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const rafRef       = useRef<number | null>(null);

  // Timer
  const tickRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // Keep voiceLocale accessible inside the onstop closure without stale capture
  const voiceLocaleRef = useRef<VoiceLocale | null>(voiceLocale);
  useEffect(() => { voiceLocaleRef.current = voiceLocale; }, [voiceLocale]);

  // ── Initialise locale preference ──────────────────────────────────────────
  useEffect(() => { setVoiceLocale(loadPreferred(locale)); }, [locale]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => { releaseAudioResources(); }, []);

  // ── Browser support check ─────────────────────────────────────────────────
  const isSupported =
    typeof window !== "undefined" && typeof MediaRecorder !== "undefined";

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Stop all audio resources: stream, AudioContext, level-meter RAF, timer. */
  function releaseAudioResources() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tk) => tk.stop());
      streamRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    startedAtRef.current = null;
    setLevel(0);
  }

  /** Wire up a Web Audio analyser for the visual level meter (cosmetic only). */
  function startLevelMeter(stream: MediaStream) {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Level meter is cosmetic; silently skip if the browser doesn't cooperate
    }
  }

  // ── State machine actions ─────────────────────────────────────────────────

  /**
   * STATE: idle → requesting → recording
   *
   * 1. Request microphone permission explicitly (shows the browser prompt up-front).
   * 2. Start a Web Audio analyser for the level visualisation.
   * 3. Create a MediaRecorder and start it with a 1-second timeslice.
   *    The timeslice guarantees ondataavailable fires regularly on mobile Chrome,
   *    preventing the "empty blob on first stop" bug.
   */
  async function startRecording() {
    if (isProcessingRef.current) return;

    // Reset state for a fresh session
    setRecState("requesting");
    setErrorDetail(null);
    setTranscript("");
    chunksRef.current = [];

    // ── 1. Request microphone permission ───────────────────────────────────
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (e) {
      const err = e as DOMException;
      let msg: string;
      if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError"
      ) {
        msg = t("voice.denied") !== "voice.denied"
          ? t("voice.denied")
          : "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (
        err?.name === "NotFoundError" ||
        err?.name === "DevicesNotFoundError"
      ) {
        msg = t("voice.no_device") !== "voice.no_device"
          ? t("voice.no_device")
          : "No microphone found. Please connect a microphone and try again.";
      } else {
        msg = err?.message ?? String(e);
      }
      setErrorDetail(msg);
      setRecState("error");
      return;
    }

    streamRef.current = stream;

    // ── 2. Level meter (cosmetic) ──────────────────────────────────────────
    startLevelMeter(stream);

    // ── 3. Create MediaRecorder ────────────────────────────────────────────
    const mimeType = getBestMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      // Last resort: no mimeType constraint
      try {
        recorder = new MediaRecorder(stream);
      } catch (e) {
        setErrorDetail(
          "Unable to start recording on this browser. " + String(e)
        );
        setRecState("error");
        releaseAudioResources();
        return;
      }
    }

    // ── ondataavailable: accumulate chunks ONLY — no processing here ───────
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    // ── onstop: called after Stop is pressed and the final chunk arrives ───
    recorder.onstop = async () => {
      // Release the microphone and level meter immediately
      releaseAudioResources();

      // Guard against duplicate processing (e.g. rapid Stop clicks)
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      setRecState("processing");

      try {
        const usedMime =
          recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: usedMime });
        chunksRef.current = []; // free memory

        if (blob.size === 0) {
          throw new Error(
            "No audio data was captured. Please check your microphone and try again."
          );
        }

        // Determine the right file extension for the transcription server
        const ext = usedMime.includes("mp4") ? "mp4"
                  : usedMime.includes("ogg") ? "ogg"
                  : usedMime.includes("mpeg") || usedMime.includes("mp3") ? "mp3"
                  : "webm";

        const form = new FormData();
        form.append("audio", blob, `recording.${ext}`);
        form.append(
          "lang",
          voiceLocaleRef.current?.code ??
            (locale === "ar" ? "ar" : "en-US")
        );

        // ── Send complete audio blob to the transcription API ──────────────
        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: form,
        });

        let responseBody: { transcript?: string; error?: string };
        try {
          responseBody = await res.json();
        } catch {
          responseBody = { error: `HTTP ${res.status}` };
        }

        if (!res.ok) {
          throw new Error(
            responseBody?.error ?? `Transcription failed (HTTP ${res.status})`
          );
        }

        const text = (responseBody.transcript ?? "").trim();
        if (!text) {
          throw new Error(
            "No speech was detected in the recording. Please speak clearly and try again."
          );
        }

        // ── Deliver the final transcript to the parent ─────────────────────
        setTranscript(text);
        onTranscript(text, true);
        setRecState("completed");
      } catch (e: unknown) {
        setErrorDetail(e instanceof Error ? e.message : String(e));
        setRecState("error");
      } finally {
        isProcessingRef.current = false;
      }
    };

    recorder.onerror = () => {
      setErrorDetail("A recording error occurred. Please try again.");
      setRecState("error");
      releaseAudioResources();
      mediaRecorderRef.current = null;
    };

    // ── 4. Start recording ─────────────────────────────────────────────────
    // timeslice=1000 → ondataavailable fires every ~1 s during recording,
    // ensuring we accumulate data on mobile Chrome even for short clips.
    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setRecState("recording");

    // ── 5. Start the elapsed-time ticker ──────────────────────────────────
    setElapsed(0);
    startedAtRef.current = Date.now();
    tickRef.current = setInterval(() => {
      if (startedAtRef.current) {
        setElapsed(
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
      }
    }, 1000);
  }

  /**
   * STATE: recording → stopping
   *
   * Sets the state to "stopping" immediately so the UI reflects the change,
   * stops the timer, then calls recorder.stop() which will trigger onstop
   * asynchronously. The actual processing happens inside onstop.
   *
   * Idempotent: calling this more than once while already in "stopping" or
   * "processing" has no effect.
   */
  function stopRecording() {
    if (recState !== "recording") return;

    setRecState("stopping");

    // Stop the timer immediately so the user doesn't see it keep counting
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    try {
      mediaRecorderRef.current?.stop();
    } catch {
      /* MediaRecorder.stop() may throw if already stopped; safe to ignore */
    }
    mediaRecorderRef.current = null;
  }

  /** Reset to idle so the user can try again after an error or completion. */
  function resetToIdle() {
    setErrorDetail(null);
    setTranscript("");
    chunksRef.current = [];
    isProcessingRef.current = false;
    setRecState("idle");
  }

  // ── Locale picker ─────────────────────────────────────────────────────────

  function pickLocale(v: VoiceLocale) {
    setVoiceLocale(v);
    savePreferred(locale, v);
    setPickerOpen(false);
  }

  // ── Derived booleans ──────────────────────────────────────────────────────

  // MediaRecorder is not available (old browsers / non-HTTPS)
  if (!isSupported) {
    return (
      <span
        className={`text-xs text-slate-500 ${className ?? ""}`}
        title="Voice recording requires a modern browser over HTTPS"
      >
        🎤 —
      </span>
    );
  }

  const isRecording = recState === "recording";
  // Busy: don't allow any user action during these transient states
  const isBusy =
    recState === "requesting" ||
    recState === "stopping" ||
    recState === "processing";
  // Can start a new recording
  const canStart =
    recState === "idle" || recState === "completed" || recState === "error";

  const list = listFor(locale);

  const stateLabel: Record<RecState, string> = {
    idle:       "",
    requesting: "Requesting microphone…",
    recording:  "", // shown via timer+level meter below
    stopping:   "Stopping…",
    processing: "Transcribing…",
    completed:  "",
    error:      "",
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`relative flex items-center gap-1.5 ${className ?? ""}`}>

      {/* ── Transcript popover (completed state) ── */}
      {recState === "completed" && transcript && (
        <div
          className="absolute bottom-full end-0 mb-2 max-w-[min(520px,calc(100vw-2rem))] min-w-[220px] rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-lg px-3 py-2 z-30"
          aria-live="polite"
        >
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wide">
            Transcription complete
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-100 whitespace-pre-wrap line-clamp-4">
            {transcript}
          </p>
        </div>
      )}

      {/* ── Error popover ── */}
      {recState === "error" && errorDetail && (
        <div
          className="absolute bottom-full end-0 mb-2 max-w-[min(520px,calc(100vw-2rem))] min-w-[220px] rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 shadow-lg px-3 py-2 z-30"
          aria-live="assertive"
          role="alert"
        >
          <p className="text-xs text-rose-700 dark:text-rose-300">{errorDetail}</p>
          {onTypeInstead && (
            <button
              type="button"
              onClick={() => { resetToIdle(); onTypeInstead(); }}
              className="mt-2 btn-ghost text-[11px] px-2 py-1 border border-slate-300 dark:border-slate-700"
            >
              ⌨️{" "}
              {t("voice.type_instead") !== "voice.type_instead"
                ? t("voice.type_instead")
                : "Type instead"}
            </button>
          )}
        </div>
      )}

      {/* ── Dialect / language picker ── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-label={
            t("voice.dialect") !== "voice.dialect"
              ? t("voice.dialect")
              : "Select recording language"
          }
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          disabled={isRecording || isBusy}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white hover:border-brand-400 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-brand-500 transition text-base leading-none disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            voiceLocale
              ? labelFor(voiceLocale, locale)
              : (t("voice.dialect") !== "voice.dialect"
                  ? t("voice.dialect")
                  : "Select language")
          }
        >
          <span aria-hidden="true">{voiceLocale?.flag ?? "🌐"}</span>
        </button>

        {pickerOpen && (
          <ul
            role="listbox"
            aria-label="Recording language"
            className="absolute bottom-full mb-2 end-0 z-40 max-h-72 w-44 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1"
          >
            {list.map((v) => {
              const active = voiceLocale?.code === v.code;
              return (
                <li key={v.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pickLocale(v)}
                    className={
                      "w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 " +
                      (active
                        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium"
                        : "text-slate-700 dark:text-slate-200")
                    }
                  >
                    <span aria-hidden="true" className="text-base">{v.flag}</span>
                    <span className="truncate flex-1 text-start">{labelFor(v, locale)}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">{v.code}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Main record / stop button ── */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : canStart ? startRecording : undefined}
        disabled={isBusy}
        aria-label={
          isRecording
            ? (t("voice.stop") !== "voice.stop" ? t("voice.stop") : "Stop recording")
            : (t("voice.start") !== "voice.start" ? t("voice.start") : "Start recording")
        }
        aria-pressed={isRecording}
        className={
          "relative inline-flex items-center justify-center w-10 h-10 rounded-full transition shadow-sm " +
          "disabled:opacity-50 disabled:cursor-not-allowed " +
          (isRecording
            ? "bg-rose-600 text-white shadow-rose-300/50 hover:bg-rose-700"
            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 " +
              "text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:text-brand-700")
        }
      >
        {/* Icon changes based on state */}
        {isBusy ? (
          // Spinning indicator during transient states
          <svg
            className="animate-spin w-4.5 h-4.5"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12" cy="12" r="9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="20 40"
            />
          </svg>
        ) : isRecording ? (
          // Stop square
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          // Microphone
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        )}

        {/* Pulse ring + level ring when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/40" aria-hidden="true" />
            <span
              className="absolute inset-0 rounded-full bg-rose-300/25"
              style={{
                transform: `scale(${1 + level * 0.45})`,
                transition: "transform 80ms linear",
              }}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {/* ── Status label ── */}
      {recState === "recording" && (
        <span
          className="flex items-center gap-2 text-xs text-rose-600 font-medium"
          aria-live="polite"
        >
          {/* Elapsed timer */}
          <span className="tabular-nums">● {formatElapsed(elapsed)}</span>

          {/* 5-bar level meter */}
          <span className="inline-flex items-end gap-[2px] h-3.5" aria-hidden="true">
            {[0.15, 0.35, 0.55, 0.75, 0.95].map((threshold, i) => (
              <span
                key={i}
                className={
                  "w-[3px] rounded-sm transition-colors " +
                  (level >= threshold ? "bg-rose-600" : "bg-rose-200")
                }
                style={{ height: `${30 + i * 14}%` }}
              />
            ))}
          </span>

          <span>
            {t("voice.listening") !== "voice.listening"
              ? t("voice.listening")
              : "Recording"}
          </span>
        </span>
      )}

      {/* Transient state labels */}
      {stateLabel[recState] && (
        <span className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          {recState === "processing" ? (
            <span className="flex items-center gap-1.5">
              <svg
                className="animate-spin w-3 h-3 text-sky-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeDasharray="15 45" />
              </svg>
              {stateLabel[recState]}
            </span>
          ) : (
            stateLabel[recState]
          )}
        </span>
      )}
    </div>
  );
}
