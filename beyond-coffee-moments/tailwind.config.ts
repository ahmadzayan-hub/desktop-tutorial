import type { Config } from "tailwindcss";

/**
 * Premium UAE gifting palette:
 *  - cream: warm background
 *  - coffee: deep coffee brown (primary)
 *  - gold: muted gold accent
 * Logical properties (ps/pe/ms/me) are used across the app so layouts mirror
 * automatically in Arabic RTL mode.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F7F1E7",
          50: "#FCF9F3",
          100: "#F7F1E7",
          200: "#EFE4D2",
        },
        coffee: {
          DEFAULT: "#3B2A20",
          50: "#F4EEE9",
          100: "#E4D6CC",
          400: "#6B4E3D",
          600: "#4A3225",
          700: "#3B2A20",
          900: "#241812",
        },
        gold: {
          DEFAULT: "#B08A45",
          soft: "#C9A563",
          400: "#C9A563",
          500: "#B08A45",
          600: "#977435",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        arabic: ["'IBM Plex Sans Arabic'", "'Noto Sans Arabic'", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(59,42,32,0.04), 0 8px 24px rgba(59,42,32,0.06)",
        card: "0 1px 3px rgba(59,42,32,0.05), 0 12px 32px rgba(59,42,32,0.07)",
        gold: "0 8px 24px rgba(176,138,69,0.18)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      maxWidth: {
        content: "78rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        steam: {
          "0%": { opacity: "0", transform: "translateY(0) scaleX(1)" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "0", transform: "translateY(-16px) scaleX(1.4)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        steam: "steam 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
