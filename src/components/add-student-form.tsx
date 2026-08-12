"use client";

import { useActionState, useRef, useEffect } from "react";
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
      className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-3"
    >
      <input type="hidden" name="class_code" value={classCode} />
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-slate-500">이름</label>
        <input
          name="name"
          required
          placeholder="홍길동"
          className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-slate-500">학번(선택)</label>
        <input
          name="student_number"
          placeholder="10203"
          className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "추가 중..." : "학생 추가"}
      </button>
      {state?.error && (
        <p className="w-full text-xs text-red-500">{state.error}</p>
      )}
    </form>
  );
}
