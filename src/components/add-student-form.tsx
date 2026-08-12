"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createStudentAction } from "@/app/actions";
import type { ClassCode } from "@/lib/class-codes";

export function AddStudentForm({ classCode }: { classCode: ClassCode }) {
  const [state, formAction, pending] = useActionState(createStudentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.error === "") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-ui border border-dashed border-slate-300 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
    >
      <input type="hidden" name="class_code" value={classCode} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="new-student-name" className="text-xs font-semibold text-slate-600">이름</label>
        <input
          id="new-student-name"
          name="name"
          required
          placeholder="홍길동"
          disabled={pending}
          className="min-h-11 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-100"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="new-student-number" className="text-xs font-semibold text-slate-600">학번(선택)</label>
        <input
          id="new-student-number"
          name="student_number"
          placeholder="10203"
          disabled={pending}
          className="min-h-11 min-w-0 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "추가 중..." : "학생 추가"}
      </button>
      {state?.error && (
        <p role="alert" className="text-xs text-red-600 sm:col-span-3">{state.error}</p>
      )}
    </form>
  );
}
