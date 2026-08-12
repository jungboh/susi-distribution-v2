import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cx } from "@/lib/ui";

export function DataTableShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("ui-table-shell", className)} {...props} />;
}

export function DataTable({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cx("ui-data-table", className)} {...props} />;
}
