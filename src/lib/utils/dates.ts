import { format, parseISO } from "date-fns";

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return format(d, "dd MMM yyyy");
}

export function formatDateLong(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return format(d, "dd MMMM yyyy");
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const d = typeof value === "string" ? parseISO(value) : value;
  const diffMs = d.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function countdownColor(days: number | null): "green" | "amber" | "red" | "neutral" {
  if (days === null) return "neutral";
  if (days < 30) return "red";
  if (days <= 60) return "amber";
  return "green";
}
