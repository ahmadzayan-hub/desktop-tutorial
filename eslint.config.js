// ESLint flat config for the Lahza Vite + React + TypeScript app.
// Sub-projects (wisal-web static, telegram-wife-assistant Node, landing static,
// android-wife-assistant Kotlin, agent-os) are ignored and use their own tooling.
//
// Kept intentionally low-friction: syntax + unused vars + hooks correctness.
// TypeScript already provides `no-undef` and unused-var reporting, so those
// core rules are turned off to avoid double-reporting.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "landing/**",
      "wisal-web/**",
      "wisal-desktop/**",
      "android-wife-assistant/**",
      "telegram-wife-assistant/**",
      "agent-os/**",
      "docs/**",
      "public/**",
      "coverage/**",
      "*.config.js",
      "*.config.cjs",
      "*.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
