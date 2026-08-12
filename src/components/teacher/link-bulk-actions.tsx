"use client";

import { useState } from "react";
import type { ClassCode } from "@/lib/class-codes";

export function LinkBulkActions({ classCode, className }: { classCode: ClassCode; className: string }) {
  const [pending, setPending] = useState<"excel" | "guide" | null>(null);
  const [message, setMessage] = useState("");
  async function downloadExcel() {
    if (pending) return;
    setPending("excel"); setMessage("");
    try {
      const response = await fetch(`/teacher/links/export/xlsx?class=${classCode}`);
      if (!response.ok) throw new Error("download");
      const blob = await response.blob();
      const href = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = href; anchor.download = `2026_${className}_학생접속링크.xlsx`; anchor.click(); URL.revokeObjectURL(href);
    } catch { setMessage("Excel을 만들지 못했습니다. 배포 주소와 로그인 상태를 확인해 주세요."); }
    finally { setPending(null); }
  }
  function openGuide() {
    if (pending) return;
    setPending("guide"); setMessage("");
    const popup = window.open(`/teacher/links/guide?class=${classCode}`, "_blank", "noopener,noreferrer");
    if (!popup) setMessage("새 창이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
    window.setTimeout(() => setPending(null), 500);
  }
  return <div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={pending !== null} aria-busy={pending === "excel"} onClick={downloadExcel} className="min-h-10 rounded-lg border border-line px-4 text-sm font-semibold text-navy disabled:opacity-50">{pending === "excel" ? "Excel 생성 중…" : "전체 링크 Excel"}</button><button type="button" disabled={pending !== null} aria-busy={pending === "guide"} onClick={openGuide} className="min-h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50">{pending === "guide" ? "안내문 여는 중…" : "안내문 일괄 출력 (새 창)"}</button>{message && <p role="status" aria-live="polite" className="w-full text-right text-xs text-red-700">{message}</p>}</div>;
}
