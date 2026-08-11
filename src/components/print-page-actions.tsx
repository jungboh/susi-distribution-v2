"use client";

import { useEffect } from "react";

export function PrintPageActions({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        인쇄 또는 PDF 저장
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
      >
        닫기
      </button>
    </div>
  );
}
