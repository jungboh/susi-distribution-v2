import Link from "next/link";
import { lockTeacherClassAction } from "@/app/teacher/auth-actions";

export function TeacherHeader({
  title,
  backHref,
  backLabel = "목록으로",
  showClassLock = true,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  showClassLock?: boolean;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-1 inline-block text-xs text-slate-400 hover:text-brand"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>
      {showClassLock && (
        <form action={lockTeacherClassAction}>
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-brand hover:text-brand">
            학급 잠금 후 선택
          </button>
        </form>
      )}
    </div>
  );
}
