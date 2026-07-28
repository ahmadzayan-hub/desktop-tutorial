import { Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

/** Horizontal step indicator for the customise / corporate flows. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  const { t } = useI18n();
  const progressLabel = `${t("common.step")} ${current + 1} / ${steps.length}`;
  return (
    <nav aria-label={progressLabel}>
      <ol className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((label, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          return (
            <li
              key={label}
              className="flex min-w-0 flex-1 items-center gap-1.5"
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                aria-hidden="true"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                  state === "done"
                    ? "bg-gold-500 text-white"
                    : state === "active"
                      ? "bg-coffee-700 text-cream-50 ring-4 ring-coffee-700/15"
                      : "bg-coffee-50 text-coffee-400"
                }`}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden truncate text-xs font-medium sm:block ${
                  state === "active" ? "text-coffee-900" : "text-coffee-400"
                }`}
              >
                {label}
              </span>
              {i < steps.length - 1 && <span aria-hidden="true" className="h-px flex-1 bg-coffee-100" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
