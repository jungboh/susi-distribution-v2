"use client";

export function LinkGuideActions() {
  return <div className="link-guide-actions no-print mx-auto mb-4 flex max-w-[210mm] justify-end gap-2 px-4"><button type="button" onClick={() => window.print()} className="min-h-11 rounded-lg bg-navy px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">인쇄 또는 PDF 저장</button><button type="button" onClick={() => window.close()} className="min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">닫기</button></div>;
}
