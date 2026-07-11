import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-coffee-600">{subtitle}</p>}
    </div>
  );
}

export function Section({
  children,
  className = "",
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={`${muted ? "bg-cream-50" : ""} py-14 sm:py-20 ${className}`}>
      <div className="container-max">{children}</div>
    </section>
  );
}
