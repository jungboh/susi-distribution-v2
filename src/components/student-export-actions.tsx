"use client";

import { useState } from "react";

export function StudentExportActions({ studentId }: { studentId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const printHref = `/teacher/students/${studentId}/print`;

  async function downloadExcel() {
    if (isExporting) return;
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
    <div className="rounded-ui border border-line bg-white p-4 shadow-card">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <a
          href={`${printHref}?auto=1&intent=pdf`}
          target="_blank"
          rel="noreferrer"
          aria-label="PDF 저장 화면 새 창으로 열기"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          PDF 저장
        </a>
        <button
          type="button"
          onClick={downloadExcel}
          disabled={isExporting}
          className="min-h-11 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {isExporting ? "엑셀 생성 중…" : "엑셀 저장"}
        </button>
        <a
          href={`${printHref}?auto=1&intent=print`}
          target="_blank"
          rel="noreferrer"
          aria-label="인쇄 화면 새 창으로 열기"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          인쇄
        </a>
        <a
          href={`${printHref}?mode=parent`}
          target="_blank"
          rel="noreferrer"
          aria-label="학부모 확인서 새 창으로 열기"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          학부모 확인서
        </a>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
