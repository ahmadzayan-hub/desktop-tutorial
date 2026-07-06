import type { Config } from "tailwindcss";

// Unified Beyond Style UAE design tokens.
// Same brand system as the customer storefront (beyond-style-uae/tailwind.config.ts):
// gold as primary, ink as text, cream/pearl as canvas.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:   "#0A0A0A",
        cream: "#F5F1E8",
        pearl: "#FAF6F0",
        brand: {
          DEFAULT: "#C9A96E",
          light:   "#E4CFA1",
          dark:    "#A6864B",
          soft:    "#F0E6D1",
        },
        // Kept for backward compatibility with any lingering `brand.accent` use.
        accent: "#1f2937",
      },
      fontFamily: {
        sans:    ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["\"Cormorant Garamond\"", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 4%), 0 4px 12px rgb(0 0 0 / 4%)",
      },
    },
  },
  plugins: [],
};

export default config;
