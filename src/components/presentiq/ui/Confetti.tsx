"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * burstConfetti — fires a small particle burst from a given DOM anchor,
 * or from the centre of the viewport if no anchor is provided. Pure DOM,
 * no canvas, removes itself after the animation.
 *
 * Honours `prefers-reduced-motion` by no-op.
 */
const COLORS = ["#D4F08C", "#9FCD63", "#F4B63E", "#A5B4FC", "#67E8F9", "#C084FC"];

export function burstConfetti(anchor?: HTMLElement | null, opts?: { count?: number }) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const count = opts?.count ?? 36;
  const r = anchor?.getBoundingClientRect();
  const ox = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const oy = r ? r.top + r.height / 2 : window.innerHeight / 2;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 9998;
    overflow: hidden;
  `;
  document.body.appendChild(layer);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 220 + Math.random() * 220;
    const dx = Math.cos(angle) * speed + (Math.random() - 0.5) * 60;
    const dy = Math.sin(angle) * speed + (Math.random() - 0.5) * 60 - 80;
    const rot = (Math.random() - 0.5) * 720;
    const dur = 900 + Math.random() * 600;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `
      position: absolute;
      left: ${ox}px;
      top: ${oy}px;
      width: ${size}px;
      height: ${size * 0.4}px;
      background: ${color};
      border-radius: 2px;
      transform: translate(-50%, -50%) rotate(0deg);
      opacity: 1;
      will-change: transform, opacity;
      box-shadow: 0 0 8px ${color}66;
      transition: transform ${dur}ms cubic-bezier(.15,.7,.3,1), opacity ${dur}ms ease-out;
    `;
    layer.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`;
      piece.style.opacity = "0";
    });
  }

  setTimeout(() => {
    if (layer.parentNode) layer.parentNode.removeChild(layer);
  }, 2000);
}

/**
 * useConfettiOn — wires a button-like element so that clicking/submitting
 * it triggers a confetti burst at the element's centre.
 */
export function useConfettiOn(condition: boolean | undefined) {
  const ref = useRef<HTMLElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (condition && !fired.current && ref.current) {
      burstConfetti(ref.current);
      fired.current = true;
    }
    if (!condition) fired.current = false;
  }, [condition]);

  return ref;
}

/** Render-only component that fires once on mount. Useful for "success" pages. */
export function ConfettiOnMount({ count }: { count?: number }) {
  const [done, setDone] = useState(false);
  const cb = useCallback(() => {
    burstConfetti(null, { count });
    setDone(true);
  }, [count]);

  useEffect(() => {
    if (!done) cb();
  }, [done, cb]);

  return null;
}
