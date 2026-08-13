"use client";

import { useState } from "react";
import type { ClassCode } from "@/lib/class-codes";

export function LinkExcelExportAction({ classCode, className }: { classCode: ClassCode; className: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function downloadExcel() {
    if (pending) return;
    setPending(true); setMessage("");
    try {
      const response = await fetch(`/teacher/links/export/xlsx?class=${classCode}`);
      if (!response.ok) throw new Error("download");
      const blob = await response.blob();
      const href = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = href; anchor.download = `2026_${className}_학생접속링크.xlsx`; anchor.click(); URL.revokeObjectURL(href);
    } catch { setMessage("Excel을 만들지 못했습니다. 배포 주소와 로그인 상태를 확인해 주세요."); }
    finally { setPending(false); }
  }
  return <div className="flex flex-col items-start gap-2">
    <button type="button" disabled={pending} aria-busy={pending} onClick={downloadExcel} className="min-h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">{pending ? "Excel 생성 중…" : "전체 링크 Excel 다운로드"}</button>
    {message && <p role="status" aria-live="polite" className="text-xs text-red-700">{message}</p>}
  </div>;
}

export function LinkGuideExportAction({ classCode }: { classCode: ClassCode }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  function openGuide() {
    if (pending) return;
    setPending(true); setMessage("");
    const popup = window.open(`/teacher/links/guide?class=${classCode}`, "_blank", "noopener,noreferrer");
    if (!popup) setMessage("새 창이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
    window.setTimeout(() => setPending(false), 500);
  }
  return <div className="flex flex-col items-start gap-2">
    <button type="button" disabled={pending} aria-busy={pending} onClick={openGuide} className="min-h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">{pending ? "안내문 여는 중…" : "안내문 일괄 출력 (새 창)"}</button>
    {message && <p role="status" aria-live="polite" className="text-xs text-red-700">{message}</p>}
  </div>;
}
