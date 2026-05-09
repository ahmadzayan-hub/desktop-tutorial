import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

/**
 * v0.3 dark-themed button. Defers to the same .pq-btn class set used by
 * marketing CTAs so the editor toolbar and the hero CTAs share styling.
 */
const variantClass: Record<Variant, string> = {
  primary:   "pq-btn pq-btn-primary",
  secondary: "pq-btn pq-btn-secondary",
  ghost:     "pq-btn pq-btn-ghost",
  danger:    "pq-btn pq-btn-danger",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`${variantClass[variant]} ${className}`}
      style={{ padding: "0.55rem 1rem", fontSize: "0.85rem", ...(rest.style ?? {}) }}
    >
      {children}
    </button>
  );
}
