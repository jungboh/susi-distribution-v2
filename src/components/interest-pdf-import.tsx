"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeInterestPdfAction,
  applyInterestImportAction,
} from "@/app/teacher/import-actions";
import type {
  ImportDecision,
  ImportResult,
  InterestPreview,
} from "@/lib/interest-import-types";

function formatBytes(size: number) {
  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)}KB`
    : `${(size / 1024 / 1024).toFixed(2)}MB`;
}

const STATUS_LABEL = {
  exact: "정확히 매칭",
  review: "확인 필요",
  unmatched: "미매칭",
};

export function InterestPdfImport() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<InterestPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedCount = useMemo(
    () => preview?.rows.filter((row) => row.decision !== "skip" && row.matchedStudentId).length ?? 0,
    [preview]
  );

  function patchRow(rowKey: string, patch: Partial<InterestPreview["rows"][number]>) {
    setPreview((current) => current ? {
      ...current,
      rows: current.rows.map((row) => row.rowKey === rowKey ? { ...row, ...patch } : row),
    } : current);
  }

  function analyze() {
    if (!file) { setError("PDF 파일을 선택해 주세요."); return; }
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      try {
        setPreview(await analyzeInterestPdfAction(formData));
      } catch (e) {
        setPreview(null);
        setError(e instanceof Error ? e.message : "PDF를 분석하지 못했습니다.");
      }
    });
  }

  function applyImport() {
    if (!preview || selectedCount === 0) return;
    if (!confirm(`${selectedCount}개 행을 학생 지원표에 반영할까요? 기존 행은 삭제되지 않습니다.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const applied = await applyInterestImportAction(
          preview.fileName,
          preview.rows.map((row) => ({
            row: {
              rowKey: row.rowKey, page: row.page, grade: row.grade,
              classNumber: row.classNumber, studentNumber: row.studentNumber,
              studentName: row.studentName, region: row.region,
              majorSeries: row.majorSeries, universityName: row.universityName,
              department: row.department, recruitCount: row.recruitCount,
              stage1Elements: row.stage1Elements, csatMinimum: row.csatMinimum,
              season: row.season, admissionType: row.admissionType,
              admissionName: row.admissionName, selectionType: row.selectionType,
              myGrade: row.myGrade, myScore: row.myScore,
            },
            decision: row.decision,
            targetStudentId: row.matchedStudentId,
            existingApplicationId: row.existingApplicationId,
          }))
        );
        setResult(applied);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "PDF 자료를 반영하지 못했습니다.");
      }
    });
  }

  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        관심대학 PDF 가져오기
      </button>

      {open && (
        <div className="mt-4">
          <h2 className="text-base font-bold text-slate-800">관심대학 PDF 가져오기</h2>
          <p className="mt-1 text-sm text-slate-500">
            학생별 관심대학 목록을 분석하여 기존 지원대학 아래에 선택한 행만 추가합니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPreview(null); setResult(null); setError(null);
              }}
              className="max-w-full text-sm"
            />
            {file && <span className="text-xs text-slate-500">{file.name} · {formatBytes(file.size)}</span>}
            <button
              type="button"
              onClick={analyze}
              disabled={!file || isPending}
              className="rounded-lg border border-brand px-3 py-2 text-xs font-semibold text-brand disabled:border-slate-200 disabled:text-slate-300"
            >
              {isPending ? "처리 중..." : "분석 시작"}
            </button>
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {preview && (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
                <Summary label="전체" value={preview.summary.total} />
                <Summary label="정확 매칭" value={preview.summary.exact} />
                <Summary label="확인 필요" value={preview.summary.review} />
                <Summary label="미매칭" value={preview.summary.unmatched} />
                <Summary label="신규 예정" value={preview.summary.additions} />
                <Summary label="중복 제외" value={preview.summary.duplicates} />
                <Summary label="갱신 후보" value={preview.summary.updates} />
              </div>
              <div className="mt-3 max-h-[520px] overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-[1320px] border-collapse text-xs">
                  <thead className="sticky top-0 z-20 bg-slate-100 text-slate-600">
                    <tr>
                      {['처리','매칭 상태','대상 학생','학년','반','번호','이름','지역','대학명','모집단위','전형','차이'].map((label) => (
                        <th key={label} className="border border-slate-200 px-2 py-2 whitespace-nowrap">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr key={row.rowKey} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border border-slate-100 p-1">
                          <select
                            value={row.decision}
                            onChange={(e) => patchRow(row.rowKey, { decision: e.target.value as ImportDecision })}
                            className="rounded border border-slate-200 p-1"
                          >
                            <option value="add">신규 추가</option>
                            <option value="update" disabled={!row.existingApplicationId}>기존 행 갱신</option>
                            <option value="skip">이번 행 제외</option>
                          </select>
                        </td>
                        <td className="border border-slate-100 px-2 py-1">{STATUS_LABEL[row.matchStatus]}</td>
                        <td className="border border-slate-100 p-1">
                          <select
                            value={row.matchedStudentId ?? ""}
                            onChange={(e) => patchRow(row.rowKey, {
                              matchedStudentId: e.target.value || null,
                              decision: e.target.value ? "add" : "skip",
                              existingApplicationId: null,
                            })}
                            className="max-w-[150px] rounded border border-slate-200 p-1"
                          >
                            <option value="">직접 지정</option>
                            {preview.students.map((student) => (
                              <option key={student.id} value={student.id}>{student.name} ({student.studentNumber ?? "학번 없음"})</option>
                            ))}
                          </select>
                        </td>
                        {[row.grade,row.classNumber,row.studentNumber,row.studentName,row.region,row.universityName,row.department,row.admissionName].map((value, i) => (
                          <td key={i} className="border border-slate-100 px-2 py-1">{value}</td>
                        ))}
                        <td className="border border-slate-100 px-2 py-1">
                          {row.comparison.length ? row.comparison.map((diff) => (
                            <div key={diff.field} className="mb-1"><b>{diff.field}</b>: {diff.existing || '빈 값'} → {diff.pdf || '빈 값'}</div>
                          )) : row.existingApplicationId ? "완전 중복" : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={applyImport}
                  disabled={selectedCount === 0 || isPending}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
                >최종 반영 ({selectedCount}개)</button>
                <span className="text-xs text-slate-500">확인 필요·미매칭 행은 학생을 지정하기 전까지 반영되지 않습니다.</span>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              추가 {result.inserted}개 · 갱신 {result.updated}개 · 제외 {result.skipped}개 · 실패 {result.failed}개
              {result.failures.map((failure) => <div key={failure} className="mt-1 text-xs text-red-700">{failure}</div>)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-slate-50 p-2"><div className="text-slate-400">{label}</div><div className="mt-0.5 text-lg font-bold text-slate-700">{value}</div></div>;
}
