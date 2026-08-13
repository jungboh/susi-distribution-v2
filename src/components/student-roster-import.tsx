"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { importStudentRosterAction, type StudentRosterImportState } from "@/app/actions";
import type { ClassCode } from "@/lib/class-codes";

const INITIAL_STATE: StudentRosterImportState = { error: "", added: 0, skipped: 0, failed: 0 };

export function StudentRosterImport({ classCode }: { classCode: ClassCode }) {
  const [state, formAction, pending] = useActionState(importStudentRosterAction, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.added > 0) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.added]);

  return (
    <form ref={formRef} action={formAction} className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[310px]">
      <input type="hidden" name="class_code" value={classCode} />
      <label htmlFor="student-roster-file" className="text-xs font-semibold text-slate-600">Excel 명렬표</label>
      <div className="flex min-w-0 gap-2">
        <input id="student-roster-file" name="roster_file" type="file" required accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={pending} className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-2 py-2 text-xs file:mr-2 file:rounded file:border-0 file:bg-subtle file:px-2 file:py-1 file:font-semibold file:text-navy disabled:bg-slate-100" />
        <button type="submit" disabled={pending} className="min-h-11 shrink-0 rounded-lg border border-navy bg-white px-4 text-sm font-semibold text-navy hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60">{pending ? "등록 중..." : "명렬표 등록"}</button>
      </div>
      {(state.added > 0 || state.skipped > 0 || state.failed > 0) && <p className="text-xs text-slate-600" aria-live="polite">추가 {state.added}명 · 중복 제외 {state.skipped}명 · 실패 {state.failed}명</p>}
      {state.error && <p role="alert" className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
