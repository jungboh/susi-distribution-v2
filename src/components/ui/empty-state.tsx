import type { ReactNode } from "react";
import { cx } from "@/lib/ui";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx("rounded-ui border border-dashed border-slate-300 bg-surface px-6 py-10 text-center", className)}>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
