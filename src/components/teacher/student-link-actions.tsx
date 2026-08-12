"use client";

import { useState } from "react";
import type { ClassCode } from "@/lib/class-codes";
import { buildStudentUrl } from "@/lib/student-link-url";
import type { Student } from "@/lib/types";

export function StudentLinkActions({ student, classCode }: { student: Student; classCode: ClassCode }) {
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const available = Boolean(student.access_code);

  async function copyLink() {
    if (!available) return setMessage("접속 코드가 없어 링크를 만들 수 없습니다.");
    const url = buildStudentUrl(student.access_code);
    try {
      await navigator.clipboard.writeText(url);
      setManualUrl("");
      setMessage(`${student.name} 학생 링크를 복사했습니다.`);
    } catch {
      setManualUrl(url);
      setMessage("자동 복사에 실패했습니다. 아래 링크를 직접 복사해 주세요.");
    }
  }

  return <div className="flex flex-wrap items-center justify-end gap-2">
    <button type="button" disabled={!available} onClick={copyLink} className="min-h-10 rounded-lg border border-line px-3 text-xs font-semibold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-45">개별 링크 복사</button>
    {available ? <a aria-label={`${student.name} 학생 안내문 열기 (새 창)`} href={`/teacher/links/guide?class=${classCode}&student=${encodeURIComponent(student.id)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-xs font-semibold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">안내문</a> : <span aria-disabled="true" className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-xs font-semibold text-navy opacity-45">안내문</span>}
    <span className="w-full text-right text-xs text-slate-600" role="status" aria-live="polite">{message}</span>
    {manualUrl && <div className="w-full rounded-lg bg-subtle p-3 text-left"><label className="text-xs font-semibold text-slate-700" htmlFor={`manual-${student.id}`}>직접 복사할 링크</label><input id={`manual-${student.id}`} readOnly value={manualUrl} onFocus={(event) => event.currentTarget.select()} className="mt-2 min-h-10 w-full rounded border border-line bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" /></div>}
  </div>;
}
