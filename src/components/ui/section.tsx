import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

// A cohesive section wrapper used across the workspace. Removes the
// visual "card-inside-card" noise the previous CardHeader/CardTitle
// pattern created by giving every section a shared header shape.
export function Section({
  title,
  hint,
  icon,
  action,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03),0_20px_50px_-30px_rgba(15,23,42,0.15)]",
        className,
      )}
      {...rest}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-navy/5 text-brand-navy">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="display-tight text-base font-semibold text-brand-navy sm:text-lg">
              {title}
            </h2>
            {hint && (
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {hint}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

interface EmptyProps {
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}

export function Empty({ icon, title, hint, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      {icon && (
        <div className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-400 shadow-sm">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="max-w-sm text-xs text-slate-500">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
