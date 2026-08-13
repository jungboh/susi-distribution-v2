"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buildStudentUrl } from "@/lib/student-link-url";

export function CopyLinkButton({ code }: { code: string }) {
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();
  const url = buildStudentUrl(code);

  useEffect(() => {
    if (!isFallbackOpen) return;

    inputRef.current?.focus();
    inputRef.current?.select();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsFallbackOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isFallbackOpen]);

  function openFallback() {
    setIsFallbackOpen(true);
  }

  function closeFallback() {
    setIsFallbackOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={openFallback}
        aria-expanded={isFallbackOpen}
        aria-controls={fallbackId}
        className="min-h-9 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        학생 링크 확인·복사
      </button>

      {isFallbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeFallback(); }}>
          <section id={fallbackId} role="dialog" aria-modal="true" aria-labelledby={`${fallbackId}-title`} className="w-full max-w-lg rounded-xl border border-line bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={`${fallbackId}-title`} className="text-lg font-bold text-navy">학생 링크 직접 복사</h2>
                <p className="mt-1 text-sm text-muted">아래 링크를 전체 선택한 뒤 복사해 주세요.</p>
              </div>
              <button type="button" onClick={closeFallback} aria-label="학생 링크 직접 복사 창 닫기" className="min-h-9 min-w-9 rounded-lg border border-line text-slate-600 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">×</button>
            </div>
            <div className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row">
              <input ref={inputRef} type="text" readOnly value={url} aria-label="학생 접속 링크" onClick={(event) => event.currentTarget.select()} className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-subtle px-3 text-sm text-slate-700 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              <button type="button" onClick={() => { inputRef.current?.focus(); inputRef.current?.select(); }} className="min-h-11 shrink-0 rounded-lg border border-brand bg-white px-4 text-sm font-bold text-brand hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">전체 선택</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">전체 선택 후 Ctrl+C 또는 기기의 복사 기능을 사용하세요. Escape 키로 닫을 수 있습니다.</p>
          </section>
        </div>
      )}
    </div>
  );
}
