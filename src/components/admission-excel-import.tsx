"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { analyzeAdmissionExcelAction, applyAdmissionExcelAction } from "@/app/teacher/excel-import-actions";
import type { AdmissionExcelPreview, ExcelImportDecision } from "@/lib/admission-excel-import-types";
import type { ImportResult } from "@/lib/interest-import-types";

const STATUS = { exact: "정확히 매칭", review: "확인 필요", unmatched: "미매칭" };
const DECISIONS: Array<{ value: ExcelImportDecision; label: string }> = [
  { value: "add", label: "신규 추가" }, { value: "fill", label: "빈 필드만 채우기" },
  { value: "update", label: "Excel 값으로 갱신" }, { value: "duplicate", label: "중복 제외" },
  { value: "skip", label: "이번 행 제외" },
];

export function AdmissionExcelImport() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<AdmissionExcelPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedCount = useMemo(() => preview?.rows.filter((row) => ["add", "fill", "update"].includes(row.decision) && row.matchedStudentId).length ?? 0, [preview]);

  function patchRow(rowKey: string, patch: Partial<AdmissionExcelPreview["rows"][number]>) {
    setPreview((current) => current ? { ...current, rows: current.rows.map((row) => row.rowKey === rowKey ? { ...row, ...patch } : row) } : current);
  }

  function analyze() {
    if (!file) { setError("Excel 파일을 선택해 주세요."); return; }
    const formData = new FormData(); formData.set("file", file);
    setError(null); setResult(null);
    startTransition(async () => {
      try { setPreview(await analyzeAdmissionExcelAction(formData)); }
      catch (e) { setPreview(null); setError(e instanceof Error ? e.message : "Excel을 분석하지 못했습니다."); }
    });
  }

  function applyImport() {
    if (!file || !preview || !selectedCount) return;
    if (!confirm(`${selectedCount}개 행을 반영할까요? 기존 행은 삭제되지 않습니다.`)) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("selections", JSON.stringify(preview.rows.map((row) => ({
      rowKey: row.rowKey, decision: row.decision, targetStudentId: row.matchedStudentId,
      existingApplicationId: row.existingApplicationId,
    }))));
    setError(null);
    startTransition(async () => {
      try { setResult(await applyAdmissionExcelAction(formData)); router.refresh(); }
      catch (e) { setError(e instanceof Error ? e.message : "Excel 자료를 반영하지 못했습니다."); }
    });
  }

  return (
    <section className="mb-5 rounded-xl border border-line bg-white p-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        입결통합 Excel 가져오기
      </button>
      {open && <div className="mt-4">
        <h2 className="font-bold text-slate-800">입결통합 Excel 가져오기</h2>
        <p className="mt-1 text-sm text-slate-500">학생별 입결통합 .xlsx를 분석하고 기존 자료를 보존한 채 선택 항목만 추가·보완합니다.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); setResult(null); setError(null); }} className="max-w-full text-sm" />
          {file && <span className="text-xs text-slate-500">{file.name} · {(file.size / 1024).toFixed(1)}KB</span>}
          <button type="button" onClick={analyze} disabled={!file || isPending} className="rounded-lg border border-brand px-3 py-2 text-xs font-semibold text-brand disabled:border-slate-200 disabled:text-slate-300">{isPending ? "처리 중..." : "분석 시작"}</button>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {preview && <div className="mt-5">
          <div className="grid grid-cols-3 gap-2 text-xs md:grid-cols-5 lg:grid-cols-9">
            {[
              ["전체", preview.summary.total], ["학생", preview.summary.studentCount], ["정확 매칭", preview.summary.exact],
              ["확인 필요", preview.summary.review], ["미매칭", preview.summary.unmatched], ["신규", preview.summary.additions],
              ["완전 중복", preview.summary.duplicates], ["빈 필드 보완", preview.summary.fills], ["갱신 후보", preview.summary.updates],
            ].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-slate-50 p-2"><div className="text-slate-500">{label}</div><div className="text-lg font-bold text-slate-800">{value}</div></div>)}
          </div>
          <div className="mt-3 max-h-[560px] overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-[1500px] border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-slate-100"><tr>{["처리", "매칭", "대상 학생", "Excel 행", "학년", "반", "번호", "이름", "지역", "지원대학", "모집단위", "전형명", "차이·경고"].map((label) => <th key={label} className="border border-slate-200 px-2 py-2 whitespace-nowrap">{label}</th>)}</tr></thead>
              <tbody>{preview.rows.map((row) => <tr key={row.rowKey} className="odd:bg-white even:bg-slate-50/60">
                <td className="border border-slate-100 p-1"><select value={row.decision} onChange={(e) => patchRow(row.rowKey, { decision: e.target.value as ExcelImportDecision })} className="rounded border p-1">{DECISIONS.map((option) => <option key={option.value} value={option.value} disabled={(option.value === "fill" || option.value === "update") && !row.existingApplicationId}>{option.label}</option>)}</select></td>
                <td className="border border-slate-100 px-2 py-1">{STATUS[row.matchStatus]}</td>
                <td className="border border-slate-100 p-1"><select value={row.matchedStudentId ?? ""} onChange={(e) => patchRow(row.rowKey, { matchedStudentId: e.target.value || null, existingApplicationId: null, decision: e.target.value ? "add" : "skip" })} className="max-w-[160px] rounded border p-1"><option value="">직접 지정</option>{preview.students.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.studentNumber ?? "학번 없음"})</option>)}</select></td>
                {[row.sourceRow, row.grade, row.classNumber, row.studentNumber, row.studentName, row.region, row.universityName, row.department, row.admissionName].map((value, index) => <td key={index} className="border border-slate-100 px-2 py-1">{value}</td>)}
                <td className="border border-slate-100 px-2 py-1">
                  {row.fillCandidates.map((diff) => <div key={`f-${diff.field}`} className="text-blue-700">보완 {diff.field}: {diff.excel}</div>)}
                  {row.conflicts.map((diff) => <div key={`c-${diff.field}`} className="text-amber-700">차이 {diff.field}: {diff.existing || "빈 값"} → {diff.excel}</div>)}
                  {row.warnings.map((warning) => <div key={warning} className="text-red-600">{warning}</div>)}
                  {!row.fillCandidates.length && !row.conflicts.length && !row.warnings.length && (row.existingApplicationId ? "완전 중복" : "-")}
                </td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={applyImport} disabled={!selectedCount || isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">최종 반영 ({selectedCount}개)</button><span className="text-xs text-slate-500">최종 반영 시 원본 파일과 DB 상태를 서버에서 다시 검증합니다.</span></div>
        </div>}
        {result && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">추가 {result.inserted} · 보완/갱신 {result.updated} · 제외 {result.skipped} · 실패 {result.failed}{result.failures.map((failure) => <div key={failure} className="mt-1 text-xs text-red-700">{failure}</div>)}</div>}
      </div>}
    </section>
  );
}
