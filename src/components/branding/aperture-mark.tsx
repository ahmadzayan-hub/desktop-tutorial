// The Mutabasir aperture mark. A hexagonal iris in navy with a gold
// focus point at the centre — a nod to "the director's lens". Sized by
// the outer div; the SVG scales.

import { cn } from "@/lib/utils/cn";

interface Props {
  className?: string;
  gradient?: boolean;
}

export function ApertureMark({ className, gradient = true }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {gradient && (
        <defs>
          <linearGradient id="aperture-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1F259F" />
            <stop offset="1" stopColor="#12175E" />
          </linearGradient>
        </defs>
      )}
      <rect
        width="32"
        height="32"
        rx="7"
        fill={gradient ? "url(#aperture-bg)" : "currentColor"}
      />
      <g fill="#FFFFFF" opacity="0.92">
        <path d="M16 6.5 L21.2 9.8 L16 13 Z" />
        <path d="M25.5 12.2 L24.5 18.3 L19 13.6 Z" />
        <path d="M23.5 22.5 L18.4 18.9 L24 15.9 Z" />
        <path d="M16 25.5 L10.8 22.2 L16 19 Z" />
        <path d="M6.5 19.8 L7.5 13.7 L13 18.4 Z" />
        <path d="M8.5 9.5 L13.6 13.1 L8 16.1 Z" />
      </g>
      <circle cx="16" cy="16" r="2.6" fill="#E8B34B" />
      <circle cx="16" cy="16" r="1" fill="#12175E" />
    </svg>
  );
}
