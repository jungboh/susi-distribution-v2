import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("mx-auto w-full max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-7", className)} {...props} />;
}

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <header className={cx("mb-6 flex flex-wrap items-start justify-between gap-4", className)} {...props}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export type PageSectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function PageSection({ title, description, actions, children, className, ...props }: PageSectionProps) {
  return (
    <section className={cx("mb-6", className)} {...props}>
      {(title || description || actions) && (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
