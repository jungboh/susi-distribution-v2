"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buildStudentUrl } from "@/lib/student-link-url";

const COPY_TIMEOUT_MS = 1500;

export function CopyLinkButton({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAttemptRef = useRef(0);
  const fallbackId = useId();
  const url = buildStudentUrl(code);

  useEffect(() => {
    return () => {
      copyAttemptRef.current += 1;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

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

  function showCopiedStatus() {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setStatus("copied");
    resetTimerRef.current = setTimeout(() => {
      setStatus("idle");
      resetTimerRef.current = null;
    }, 2500);
  }

  function invalidateCopyAttempt() {
    copyAttemptRef.current += 1;
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }

  function openFallback(failed = false) {
    invalidateCopyAttempt();
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setStatus(failed ? "failed" : "idle");
    setIsFallbackOpen(true);
  }

  function closeFallback() {
    setIsFallbackOpen(false);
    setStatus("idle");
    buttonRef.current?.focus();
  }

  async function handleCopy() {
    if (status === "copying") return;

    invalidateCopyAttempt();
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    const attempt = copyAttemptRef.current;
    setStatus("copying");

    if (!navigator.clipboard?.writeText) {
      if (attempt === copyAttemptRef.current) openFallback(true);
      return;
    }

    try {
      const result = await Promise.race([
        navigator.clipboard.writeText(url).then(() => "copied" as const),
        new Promise<"timeout">((resolve) => {
          copyTimeoutRef.current = setTimeout(() => resolve("timeout"), COPY_TIMEOUT_MS);
        }),
      ]);

      if (attempt !== copyAttemptRef.current) return;
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      if (result === "timeout") {
        openFallback(true);
        return;
      }
      showCopiedStatus();
    } catch {
      if (attempt !== copyAttemptRef.current) return;
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      openFallback(true);
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleCopy}
        disabled={status === "copying"}
        aria-expanded={isFallbackOpen}
        aria-controls={fallbackId}
        className="min-h-9 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait disabled:opacity-70"
      >
        {status === "copying" ? "복사 중…" : status === "copied" ? "복사됨" : "링크 복사"}
      </button>
      <button
        type="button"
        onClick={() => openFallback(false)}
        className="min-h-9 rounded-lg px-2 text-xs font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        직접 복사
      </button>
      <span aria-live="polite" className="sr-only">
        {status === "copied" ? "학생 링크가 복사되었습니다." : status === "failed" ? "자동 복사에 실패했습니다. 수동 복사 창에서 링크를 복사해 주세요." : ""}
      </span>

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
            {status === "failed" && <p role="status" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">자동 복사를 사용할 수 없어 직접 복사 화면을 열었습니다.</p>}
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
