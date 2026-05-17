"use client";

import { motion } from "framer-motion";

export default function Marquee({
  items,
  speed = 35,
}: {
  items: string[];
  speed?: number;
}) {
  const row = [...items, ...items, ...items];
  return (
    <div
      className="relative overflow-hidden bg-beyond-charcoal text-beyond-ivory border-y border-white/5"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-y-0 start-0 w-16 bg-gradient-to-r from-[#1F2933] to-transparent z-10"
      />
      <div
        className="pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-[#1F2933] to-transparent z-10"
      />
      <motion.div
        className="flex items-center gap-10 py-4 whitespace-nowrap will-change-transform"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {row.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-[12.5px] tracking-[0.22em] uppercase font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-beyond-gold" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
