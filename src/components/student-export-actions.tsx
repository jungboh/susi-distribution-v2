"use client";

import { useEffect, useRef, useState } from "react";

export function StudentExportActions({ studentId }: { studentId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const printHref = `/teacher/students/${studentId}/print`;

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  async function downloadExcel() {
    if (isExporting) return;
    setIsOpen(false);
    setIsExporting(true);
    setError("");

    try {
      const response = await fetch(
        `/teacher/students/${studentId}/export/xlsx`,
        { credentials: "same-origin" }
      );
      const contentType = response.headers.get("Content-Type") ?? "";
      if (
        !response.ok ||
        !contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        throw new Error("export failed");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const filename = encodedName
        ? decodeURIComponent(encodedName)
        : "2026_수시지원서류.xlsx";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button type="button" aria-expanded={isOpen} aria-controls="student-export-menu" onClick={() => setIsOpen((open) => !open)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand bg-white px-4 text-sm font-bold text-brand hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">▣ 문서 출력⌄</button>
      {isOpen && <div id="student-export-menu" role="menu" className="absolute right-0 z-20 mt-2 grid w-52 gap-1 rounded-xl border border-line bg-white p-2 shadow-xl">
        <a
          href={`${printHref}?auto=1&intent=pdf`}
          target="_blank"
          rel="noreferrer"
          aria-label="PDF 저장 화면 새 창으로 열기"
          role="menuitem"
          onClick={() => setIsOpen(false)}
          className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          PDF 저장
        </a>
        <button
          type="button"
          onClick={downloadExcel}
          role="menuitem"
          disabled={isExporting}
          className="min-h-10 rounded-lg px-3 text-left text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
        >
          {isExporting ? "엑셀 생성 중…" : "엑셀 저장"}
        </button>
        <a
          href={`${printHref}?auto=1&intent=print`}
          target="_blank"
          rel="noreferrer"
          aria-label="인쇄 화면 새 창으로 열기"
          role="menuitem"
          onClick={() => setIsOpen(false)}
          className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          인쇄
        </a>
        <a
          href={`${printHref}?mode=parent`}
          target="_blank"
          rel="noreferrer"
          aria-label="학부모 확인서 새 창으로 열기"
          role="menuitem"
          onClick={() => setIsOpen(false)}
          className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          학부모 확인서
        </a>
      </div>}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
