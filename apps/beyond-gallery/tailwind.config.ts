import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Cormorant Garamond", "Georgia", "serif"],
        body: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        arabic: ["Tajawal", "Alexandria", "Dubai", "sans-serif"],
        arabicDisplay: ["Alexandria", "Tajawal", "Dubai", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
