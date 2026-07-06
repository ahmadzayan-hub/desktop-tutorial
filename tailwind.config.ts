import type { Config } from "tailwindcss";

/**
 * Beyond Coffee Moments — refreshed premium identity.
 * Warm ivory canvas · rich espresso brown · brass-gold accent · a whisper of
 * majlis green. Logical properties (ps/pe/ms/me) everywhere so the layout
 * mirrors cleanly in Arabic RTL.
 *
 * Colour keys are kept stable (coffee, cream, gold) and only re-tuned, so
 * the whole app re-skins from this one file.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF6EC", // page canvas
          50: "#FFFDF9", // card / near-white warm
          100: "#FBF6EC",
          200: "#EFE4D2", // muted surface / hairline
        },
        coffee: {
          DEFAULT: "#2A1B12",
          50: "#F4ECE4", // subtle hover
          100: "#E7D8CB", // borders
          400: "#9B8271", // faint text
          500: "#7A5E49", // muted text
          600: "#5C4433", // body text
          700: "#2A1B12", // primary dark (buttons/footer/dark sections)
          900: "#170D08", // headings / deepest
        },
        gold: {
          DEFAULT: "#B8862F",
          soft: "#E7C578",
          400: "#D3A85A",
          500: "#B8862F",
          600: "#916719",
        },
        pine: {
          DEFAULT: "#26493B", // majlis green — sparing secondary accent
          50: "#EAF1ED",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        arabic: ["Tajawal", "'IBM Plex Sans Arabic'", "'Noto Sans Arabic'", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(38,22,14,0.04), 0 10px 30px -12px rgba(38,22,14,0.14)",
        card: "0 2px 6px rgba(38,22,14,0.05), 0 18px 40px -16px rgba(38,22,14,0.20)",
        gold: "0 10px 30px -8px rgba(184,134,47,0.40)",
        ring: "0 0 0 1px rgba(38,22,14,0.06)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.35rem",
        "3xl": "1.9rem",
      },
      maxWidth: {
        content: "80rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        steam: {
          "0%,100%": { opacity: "0", transform: "translateY(2px) scaleX(1)" },
          "50%": { opacity: "0.7", transform: "translateY(-8px) scaleX(1.15)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        steam: "steam 3s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
