import type { HTMLAttributes } from "react";
import { cx } from "@/lib/ui";

export function PageTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cx("text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl", className)} {...props} />;
}

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx("text-lg font-bold text-slate-900 sm:text-xl", className)} {...props} />;
}

export function BodyText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("text-sm leading-6 text-slate-700", className)} {...props} />;
}

export function Caption({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("text-xs leading-5 text-muted", className)} {...props} />;
}
