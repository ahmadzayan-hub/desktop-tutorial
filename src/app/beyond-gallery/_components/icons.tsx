// Lightweight inline SVG icons (no external icon set). All accept className.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export const WhatsAppIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M19.11 4.91A9.93 9.93 0 0 0 12.04 2C6.55 2 2.08 6.47 2.08 11.96c0 1.99.58 3.88 1.59 5.46L2 22l4.74-1.24a9.93 9.93 0 0 0 5.29 1.5h.01c5.49 0 9.96-4.47 9.96-9.96 0-2.66-1.04-5.16-2.89-7.04Zm-7.07 15.32h-.01a8.27 8.27 0 0 1-4.22-1.16l-.3-.18-2.81.74.75-2.74-.2-.31a8.25 8.25 0 0 1-1.27-4.42c0-4.56 3.71-8.27 8.28-8.27 2.21 0 4.29.86 5.85 2.43a8.21 8.21 0 0 1 2.42 5.85c0 4.56-3.71 8.27-8.27 8.27Zm4.78-6.19c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.02-.15.17-.31.19-.57.06-.26-.13-1.09-.4-2.08-1.28-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.11-.11.26-.31.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.59-1.42-.81-1.94-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.14 0 1.26.92 2.47 1.05 2.64.13.17 1.82 2.78 4.41 3.9.62.27 1.1.43 1.47.55.62.2 1.18.17 1.63.1.5-.08 1.54-.63 1.76-1.24.22-.6.22-1.12.15-1.23-.06-.11-.24-.17-.5-.3Z"/>
  </svg>
);

export const SparkleIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);

export const GiftIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
    <path d="M22 7H2v5h20V7Z" />
    <path d="M12 21V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
  </svg>
);

export const BoardIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M8 22h8" />
    <path d="M12 18v4" />
    <path d="M7 9h7M7 13h5" />
  </svg>
);

export const HomeDecorIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" />
    <path d="M3 11l9-7 9 7" />
    <path d="M10 21v-5h4v5" />
  </svg>
);

export const BriefcaseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </svg>
);

export const BoxIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const TagIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M21 12 12 21l-9-9V3h9l9 9Z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronDown = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export const InstagramIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

export const MailIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const CartIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 8H6" />
    <circle cx="9" cy="21" r="1.5" />
    <circle cx="18" cy="21" r="1.5" />
  </svg>
);

export const Grid2x2 = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

export const FileTextIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h6" />
  </svg>
);

export const UploadIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);

export const HeartIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1A5.5 5.5 0 1 0 3.2 12.4l8 8a1 1 0 0 0 1.4 0l8.2-8.2a5.5 5.5 0 0 0 0-7.6Z" />
  </svg>
);

export const StarSpark = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M12 2.5 13.6 9 20 10.5 13.6 12 12 18.5 10.4 12 4 10.5 10.4 9 12 2.5Z" />
  </svg>
);

export const TikTokIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M21 8.6a8.4 8.4 0 0 1-5-1.6v8.4a6.5 6.5 0 1 1-6.5-6.5c.34 0 .67.03 1 .08v3.3a3.2 3.2 0 1 0 2.2 3.05V2h3.1A5.3 5.3 0 0 0 21 5.5v3.1Z"/>
  </svg>
);

export const PhoneIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z" />
  </svg>
);

// --- Payment method marks (intentionally text-driven, not the real trademarked logos) ---

export const VisaMark = (p: P) => (
  <svg viewBox="0 0 48 16" aria-hidden {...p}>
    <text x="24" y="13" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="14" letterSpacing="0.5" fill="#1A1F71">VISA</text>
  </svg>
);

export const MasterMark = (p: P) => (
  <svg viewBox="0 0 48 16" aria-hidden {...p}>
    <circle cx="19" cy="8" r="6" fill="#EB001B" />
    <circle cx="29" cy="8" r="6" fill="#F79E1B" />
    <path d="M24 3.7a6 6 0 0 0 0 8.6 6 6 0 0 0 0-8.6Z" fill="#FF5F00" />
  </svg>
);

export const ApplePayMark = (p: P) => (
  <svg viewBox="0 0 64 16" aria-hidden {...p}>
    <text x="32" y="13" textAnchor="middle" fontFamily="-apple-system, Inter, Arial, sans-serif" fontWeight="700" fontSize="13" fill="#111"> Pay</text>
    <text x="14" y="13" textAnchor="end" fontFamily="-apple-system, Inter, Arial, sans-serif" fontWeight="700" fontSize="13" fill="#111"></text>
    <path d="M11 5.5c.5-.5 1.3-.9 1.9-.9.1.7-.2 1.4-.6 1.9-.5.5-1.2.9-1.9.9-.1-.7.2-1.4.6-1.9Zm-.5 2.4c.9 0 1.4.5 2.1.5.7 0 1.1-.5 2.1-.5.8 0 1.7.4 2.3 1.2-.6.3-1.4 1-1.4 2.4 0 1.5 1.3 2.1 1.3 2.1-.1.2-.5 1.5-1.7 1.5-.5 0-.9-.3-1.5-.3-.6 0-1 .3-1.5.3-1.2 0-2-1.2-2.6-2.2-1.2-2.1-1-4.9.9-5Z" fill="#111"/>
  </svg>
);

export const GooglePayMark = (p: P) => (
  <svg viewBox="0 0 80 16" aria-hidden {...p}>
    <text x="2" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#4285F4">G</text>
    <text x="10" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#EA4335">o</text>
    <text x="18" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#FBBC04">o</text>
    <text x="26" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#4285F4">g</text>
    <text x="34" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#34A853">l</text>
    <text x="40" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#EA4335">e</text>
    <text x="50" y="13" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="12.5" fill="#111">Pay</text>
  </svg>
);

export const TabbyMark = (p: P) => (
  <svg viewBox="0 0 64 16" aria-hidden {...p}>
    <rect width="64" height="16" rx="4" fill="#3BFFC1" />
    <text x="32" y="11.5" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="10" fill="#0A1F2C">tabby</text>
  </svg>
);

export const TamaraMark = (p: P) => (
  <svg viewBox="0 0 64 16" aria-hidden {...p}>
    <rect width="64" height="16" rx="4" fill="#1F1B3A" />
    <text x="32" y="11.5" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="10" fill="#FFC9D4">tamara</text>
  </svg>
);

export const CashMark = (p: P) => (
  <svg viewBox="0 0 64 16" aria-hidden {...p}>
    <rect width="64" height="16" rx="4" fill="#1F6F5B" />
    <text x="32" y="11.5" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="9" fill="#FAF8F1">COD in AED</text>
  </svg>
);

export const BankMark = (p: P) => (
  <svg viewBox="0 0 64 16" aria-hidden {...p}>
    <rect width="64" height="16" rx="4" fill="#171C8F" />
    <text x="32" y="11.5" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="9" fill="#E2C079">Bank Transfer</text>
  </svg>
);
