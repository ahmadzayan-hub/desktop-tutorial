import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C5A059',
          light: '#D9BC85',
          dark: '#A98844',
        },
        ink: '#000000',
        luxe: '#FAF7F0',
      },
      fontFamily: {
        sans: ['-apple-system', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
