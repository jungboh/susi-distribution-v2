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
        className="min-h-11 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        인쇄 또는 PDF 저장
      </button>
      <button
        type="button"
        onClick={() => window.close()}
        className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        닫기
      </button>
    </div>
  );
}
