"use client";

import { animate, useMotionValue, useTransform } from "motion/react";
import { motion } from "motion/react";
import { useEffect } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}

export function CountUp({
  to,
  from = 0,
  duration = 1.4,
  prefix = "",
  suffix = "",
  format,
  className,
}: CountUpProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    if (format) return format(latest);
    return `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [to, duration, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
