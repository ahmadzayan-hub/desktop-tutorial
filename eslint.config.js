import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Flat config for the Lahza root app (Vite + React + TypeScript).
// Sibling projects (wisal-*, telegram-*, android-*, landing/, *-os) are
// self-contained and linted—if at all—on their own, so they are ignored here.
export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "wisal-web",
      "wisal-desktop",
      "telegram-wife-assistant",
      "android-wife-assistant",
      "landing",
      "operational-plan",
      "agent-os",
      "agentic-os",
      "public",
      "*.config.js",
      "*.config.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
