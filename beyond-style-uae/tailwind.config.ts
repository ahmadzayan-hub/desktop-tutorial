import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f2937",
          accent: "#9ca3af",
        },
      },
    },
  },
  plugins: [],
};

export default config;
