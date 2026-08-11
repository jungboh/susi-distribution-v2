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
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-700">학생 문서 내보내기</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`${printHref}?auto=1&intent=pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          PDF 저장
        </a>
        <button
          type="button"
          onClick={downloadExcel}
          disabled={isExporting}
          className="rounded-lg border border-brand px-4 py-2 text-xs font-semibold text-brand hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
        >
          {isExporting ? "엑셀 생성 중…" : "엑셀 저장"}
        </button>
        <a
          href={`${printHref}?auto=1&intent=print`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand"
        >
          인쇄
        </a>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}
