import type { HTMLAttributes } from "react";
import { cx } from "@/lib/ui";

export type StatusTone = "success" | "warning" | "neutral" | "danger";

const tones: Record<StatusTone, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-600",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function StatusBadge({ tone = "neutral", className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex min-h-6 items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
