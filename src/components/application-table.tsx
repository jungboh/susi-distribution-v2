"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ADMISSION_TYPES,
  Application,
  MAX_APPLICATION_ROWS,
  MIN_APPLICATION_ROWS,
} from "@/lib/types";
import type { ClassCode } from "@/lib/class-codes";
import {
  addApplicationRowAction,
  deleteApplicationRowAction,
  updateApplicationFieldAction,
} from "@/app/actions";
import { EmptyState } from "@/components/ui/empty-state";

type FieldKey = Exclude<
  keyof Application,
  "id" | "student_id" | "seq" | "updated_at"
>;

type FieldConfig = {
  key: FieldKey;
  label: string;
  type: "text" | "select" | "date";
  placeholder?: string;
  wide?: boolean;
};

const FIELDS: FieldConfig[] = [
  { key: "region", label: "지역", type: "text" },
  { key: "university_name", label: "지원대학", type: "text" },
  { key: "department", label: "모집단위(학부,학과)", type: "text" },
  { key: "admission_type", label: "전형유형", type: "select" },
  { key: "admission_name", label: "전형명", type: "text" },
  { key: "admission_method", label: "전형방법", type: "text" },
  {
    key: "csat_min_grade",
    label: "수능 최저등급",
    type: "text",
    placeholder: "없음",
  },
  { key: "recruit_count", label: "모집인원", type: "text" },
  { key: "prev_recruit_count", label: "전년모집", type: "text" },
  { key: "required_documents", label: "제출서류", type: "text" },
  { key: "apply_start_date", label: "원서접수일", type: "date" },
  { key: "document_submit_date", label: "서류제출일", type: "date" },
  { key: "stage1_announce_date", label: "1단계발표일", type: "date" },
  { key: "interview_date", label: "전형일(면접)", type: "date" },
  { key: "final_announce_date", label: "최종발표일", type: "date" },
  { key: "my_grade", label: "나의 내신", type: "text" },
  { key: "prev_avg_grade", label: "전년평균", type: "text" },
  { key: "note", label: "비고", type: "text", placeholder: "자유 메모", wide: true },
];

const COMMON_ADDITIONAL_FIELDS: FieldConfig[] = [
  { key: "first_pass_cut", label: "전년합격컷", type: "text" },
  { key: "cut_70", label: "70%컷", type: "text" },
  { key: "additional_pass_cut", label: "최종컷", type: "text" },
  { key: "remarks", label: "추가 비고", type: "text", placeholder: "자유 메모", wide: true },
];

const COMMON_FIELDS = [...FIELDS, ...COMMON_ADDITIONAL_FIELDS];

function dday(dateStr: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diff === 0) return { text: "D-DAY", className: "text-red-600" };
  if (diff > 0 && diff <= 14)
    return { text: `D-${diff}`, className: "text-amber-600" };
  if (diff < 0) return { text: "지남", className: "text-slate-400" };
  return null;
}

export function ApplicationTable({
  studentId,
  accessCode,
  initialApplications,
  fillViewport = false,
  onApplicationsChange,
  onApplicationDeleted,
}: {
  studentId: string;
  classCode: ClassCode;
  accessCode?: string;
  initialApplications: Application[];
  fillViewport?: boolean;
  onApplicationsChange?: (applications: Application[]) => void;
  onApplicationDeleted?: (applicationId: string) => void;
}) {
  const router = useRouter();
  const fields = COMMON_FIELDS;
  const [rows, setRows] = useState(initialApplications);
  const rowsRef = useRef(initialApplications);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    rowsRef.current = initialApplications;
    setRows(initialApplications);
  }, [initialApplications]);

  function commitRows(next: Application[]) {
    rowsRef.current = next;
    setRows(next);
    onApplicationsChange?.(next);
  }

  function updateLocal(id: string, key: FieldKey, value: string) {
    const next = rowsRef.current.map((row) =>
      row.id === id ? { ...row, [key]: value } : row
    );
    rowsRef.current = next;
    setRows(next);
  }

  function commit(id: string, seq: number, key: FieldKey, value: string) {
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateApplicationFieldAction(
          accessCode ?? null,
          id,
          key,
          value || null
        );
        commitRows(
          rowsRef.current.map((row) => (row.id === id ? updated : row))
        );
      } catch {
        setError(`${seq}번 행을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.`);
      }
    });
  }

  function handleAddRow() {
    setError(null);
    startTransition(async () => {
      try {
        const row = await addApplicationRowAction(accessCode ?? null, studentId);
        commitRows([...rowsRef.current, row]);
        router.refresh();
      } catch {
        setError("대학 행을 추가하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  function handleDeleteRow(id: string) {
    const target = rowsRef.current.find((row) => row.id === id);
    if (!confirm(`${target?.university_name || `${target?.seq ?? "선택한"}번 행`} 정보를 삭제할까요?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteApplicationRowAction(accessCode ?? null, id);
        commitRows(
          rowsRef.current
            .filter((row) => row.id !== id)
            .map((row, i) => ({ ...row, seq: i + 1 }))
        );
        onApplicationDeleted?.(id);
        router.refresh();
      } catch {
        setError("대학을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  }

  const filledCount = rows.filter((r) => r.university_name.trim()).length;

  return (
    <div className={fillViewport ? "flex h-full flex-col" : undefined}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          지원대학 {filledCount}건 (작성란 최소 {MIN_APPLICATION_ROWS}개, 최대{" "}
          {MAX_APPLICATION_ROWS}개)
        </span>
        <span aria-live="polite">{isPending ? "변경사항 처리 중…" : ""}</span>
        {error && <span role="alert" className="text-red-600">{error}</span>}
      </div>

      <div
        className={`application-table-shell rounded-ui border border-line bg-white shadow-card ${
          fillViewport ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto"
        }`}
      >
        {rows.length === 0 ? (
          <EmptyState title="아직 입력된 지원대학이 없습니다" description="대학 추가 버튼으로 첫 지원대학 행을 만들 수 있습니다." />
        ) : (
        <table className="application-table w-full min-w-[2460px] border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <Th rowSpan={2} sticky="seq">순</Th>
              <Th rowSpan={2} sticky="region">지역</Th>
              <Th rowSpan={2} sticky="university">지원대학</Th>
              <Th rowSpan={2} sticky="department">모집단위(학부,학과)</Th>
              <Th colSpan={3}>전형개요</Th>
              <Th rowSpan={2}>수능 최저등급</Th>
              <Th rowSpan={2}>모집인원</Th>
              <Th rowSpan={2}>전년모집</Th>
              <Th rowSpan={2}>제출서류</Th>
              <Th rowSpan={2}>원서접수일</Th>
              <Th rowSpan={2}>서류제출일</Th>
              <Th rowSpan={2}>1단계발표일</Th>
              <Th rowSpan={2}>전형일(면접)</Th>
              <Th rowSpan={2}>최종발표일</Th>
              <Th rowSpan={2}>나의내신</Th>
              <Th rowSpan={2}>전년평균</Th>
              <Th rowSpan={2}>비고</Th>
              <Th rowSpan={2}>전년합격컷</Th>
              <Th rowSpan={2}>70%컷</Th>
              <Th rowSpan={2}>최종컷</Th>
              <Th rowSpan={2}>추가 비고</Th>
            </tr>
            <tr className="bg-slate-50 text-slate-500">
              <Th>전형유형</Th>
              <Th>전형명</Th>
              <Th>전형방법</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
              >
                <td className="sticky-seq border-b border-r border-line bg-inherit px-2 py-1.5 text-center align-top">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      disabled={isPending}
                      className="inline-flex size-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                      aria-label={`${row.seq}번 행 삭제`}
                    >
                      ×
                    </button>
                    <span>{row.seq}</span>
                  </div>
                </td>
                {fields.map((field, fieldIndex) => (
                  <td
                    key={field.key}
                    className={`${fieldIndex === 0 ? "sticky-region" : fieldIndex === 1 ? "sticky-university" : fieldIndex === 2 ? "sticky-department" : ""} border-b border-r border-line bg-inherit px-1 py-1 align-top focus-within:z-30`}
                  >
                    <FieldCell
                      value={(row[field.key] as string) ?? ""}
                      field={field}
                      ariaLabel={`${row.seq}번 행 ${field.label}`}
                      onChangeLocal={(value) =>
                        updateLocal(row.id, field.key, value)
                      }
                      onCommit={(value) => commit(row.id, row.seq, field.key, value)}
                    />
                    {field.type === "date" &&
                      (() => {
                        const d = dday((row[field.key] as string) ?? null);
                        return d ? (
                          <div className={`mt-0.5 text-[10px] ${d.className}`}>
                            {d.text}
                          </div>
                        ) : null;
                      })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleAddRow}
          disabled={rows.length >= MAX_APPLICATION_ROWS || isPending}
          className="rounded-lg border border-brand px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          + 대학 추가
        </button>
      </div>
    </div>
  );
}

function Th({
  children,
  rowSpan,
  colSpan,
  sticky,
}: {
  children: React.ReactNode;
  rowSpan?: number;
  colSpan?: number;
  sticky?: "seq" | "region" | "university" | "department";
}) {
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      scope={colSpan ? "colgroup" : "col"}
      className={`${sticky ? `sticky-${sticky}` : ""} border-b border-r border-line bg-slate-50 px-2 py-2 text-[11px] font-semibold whitespace-nowrap`}
    >
      {children}
    </th>
  );
}

function FieldCell({
  value,
  field,
  ariaLabel,
  onChangeLocal,
  onCommit,
}: {
  value: string;
  field: FieldConfig;
  ariaLabel: string;
  onChangeLocal: (value: string) => void;
  onCommit: (value: string) => void;
}) {
  if (field.type === "select") {
    const options =
      value && !(ADMISSION_TYPES as readonly string[]).includes(value)
        ? [value, ...ADMISSION_TYPES]
        : ADMISSION_TYPES;

    return (
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => {
          onChangeLocal(e.target.value);
          onCommit(e.target.value);
        }}
        className="min-h-9 w-full min-w-[92px] rounded border-none bg-transparent px-1 py-1 text-xs outline-none focus:bg-blue-50 focus:ring-2 focus:ring-brand/30"
      >
        <option value="">선택</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "date") {
    return (
      <input
        aria-label={ariaLabel}
        type="date"
        value={value}
        onChange={(e) => {
          onChangeLocal(e.target.value);
          onCommit(e.target.value);
        }}
        className="min-h-9 w-full min-w-[124px] rounded border-none bg-transparent px-1 py-1 text-xs outline-none focus:bg-blue-50 focus:ring-2 focus:ring-brand/30"
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      type="text"
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChangeLocal(e.target.value)}
      onBlur={(e) => onCommit(e.target.value)}
      className={`min-h-9 w-full rounded border-none bg-transparent px-1 py-1 text-xs outline-none focus:bg-blue-50 focus:ring-2 focus:ring-brand/30 ${
        field.wide ? "min-w-[220px]" : "min-w-[96px]"
      }`}
    />
  );
}
