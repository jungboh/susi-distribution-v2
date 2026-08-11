"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStudentAction } from "@/app/actions";

export function DeleteStudentButton({ studentId, name }: { studentId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`${name} 학생 데이터를 완전히 삭제할까요? 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      await deleteStudentAction(studentId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50 disabled:opacity-60"
    >
      삭제
    </button>
  );
}
