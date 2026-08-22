// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Global ignores
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.mjs", "*.config.ts"],
  },
  // Base JS rules
  js.configs.recommended,
  // TypeScript rules
  ...tseslint.configs.recommended,
  // React Hooks rules
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  // Project-specific overrides
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Allow unused vars prefixed with _ (convention for intentionally unused)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow explicit any in limited cases during migration
      "@typescript-eslint/no-explicit-any": "warn",
      // Enforce consistent returns
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    },
  }
);
