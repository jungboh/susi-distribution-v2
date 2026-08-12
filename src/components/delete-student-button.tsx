"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStudentAction } from "@/app/actions";

export function DeleteStudentButton({ studentId, name }: { studentId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`${name} 학생 데이터를 완전히 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteStudentAction(studentId);
        router.refresh();
      } catch {
        setError("학생을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`${name} 학생 삭제`}
        className="inline-flex min-h-9 items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "삭제 중" : "삭제"}
      </button>
      {error && <p role="alert" className="max-w-48 text-right text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
