"use client";

import { useEffect, useRef } from "react";

/**
 * Stardust — subtle cursor-trail sparkles on a transparent canvas.
 *
 * Particles are tiny diamond glints in the brand greens/golds. Each spawn
 * has a 80% chance to be skipped when the cursor barely moves, so the
 * effect feels delicate rather than busy. Disabled entirely when the
 * viewer prefers reduced motion or runs on a coarse pointer (touch).
 */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: string;
};

const HUES = ["#D4F08C", "#9FCD63", "#F4B63E", "#A5B4FC", "#67E8F9"];

export function Stardust() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let lastX = 0;
    let lastY = 0;
    let raf = 0;

    function resize() {
      if (!canvas || !ctx) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(x: number, y: number, intensity: number) {
      const count = Math.min(3, Math.floor(intensity));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.2 - Math.random() * 0.4,
          life: 1,
          size: 1 + Math.random() * 2.2,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
        });
      }
    }

    function onMove(e: PointerEvent) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.hypot(dx, dy);
      if (speed > 1.5) {
        // 1 particle for slow drift, up to 3 for fast flick.
        spawn(e.clientX, e.clientY, Math.min(3, 0.6 + speed * 0.04));
      }
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0.02);
      for (const p of particles) {
        p.life *= 0.945;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.005;
        ctx.save();
        ctx.globalAlpha = p.life * 0.85;
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.PI / 4);
        // Diamond glint
        ctx.fillStyle = p.hue;
        ctx.shadowColor = p.hue;
        ctx.shadowBlur = 8;
        const s = p.size * p.life;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      }
      if (particles.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "screen",
      }}
    />
  );
}
