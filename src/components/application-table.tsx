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

// 금융과 전용 컬럼. 다른 학급에는 표시하지 않는다.
const FINANCE_FIELDS: FieldConfig[] = [
  { key: "first_pass_cut", label: "전년합격컷", type: "text" },
  { key: "cut_70", label: "70%컷", type: "text" },
  { key: "additional_pass_cut", label: "최종컷", type: "text" },
  { key: "remarks", label: "비고(금융)", type: "text", placeholder: "자유 메모", wide: true },
];

function fieldsForClass(classCode: ClassCode): FieldConfig[] {
  return classCode === "finance" ? [...FIELDS, ...FINANCE_FIELDS] : FIELDS;
}

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
  classCode,
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
  const fields = fieldsForClass(classCode);
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

  function commit(id: string, key: FieldKey, value: string) {
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
        setError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "대학을 추가하지 못했습니다.");
      }
    });
  }

  function handleDeleteRow(id: string) {
    if (!confirm("이 대학 정보를 삭제할까요?")) return;
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
          {filledCount}개 작성 중 (최소 {MIN_APPLICATION_ROWS}개 권장, 최대{" "}
          {MAX_APPLICATION_ROWS}개)
        </span>
        {error && <span className="text-red-500">{error}</span>}
      </div>

      <div
        className={`rounded-xl border border-slate-200 bg-white ${
          fillViewport ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto"
        }`}
      >
        <table className="w-full min-w-[1500px] border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="bg-slate-50 text-slate-600">
              <Th rowSpan={2}>순</Th>
              <Th rowSpan={2}>지역</Th>
              <Th rowSpan={2}>지원대학</Th>
              <Th rowSpan={2}>모집단위(학부,학과)</Th>
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
              {classCode === "finance" && (
                <>
                  <Th rowSpan={2}>전년합격컷</Th>
                  <Th rowSpan={2}>70%컷</Th>
                  <Th rowSpan={2}>최종컷</Th>
                  <Th rowSpan={2}>비고(금융)</Th>
                </>
              )}
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
                <td className="border border-slate-100 px-2 py-1.5 text-center align-top">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="행 삭제"
                    >
                      ×
                    </button>
                    <span>{row.seq}</span>
                  </div>
                </td>
                {fields.map((field) => (
                  <td
                    key={field.key}
                    className="border border-slate-100 px-1 py-1 align-top"
                  >
                    <FieldCell
                      value={(row[field.key] as string) ?? ""}
                      field={field}
                      onChangeLocal={(value) =>
                        updateLocal(row.id, field.key, value)
                      }
                      onCommit={(value) => commit(row.id, field.key, value)}
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
}: {
  children: React.ReactNode;
  rowSpan?: number;
  colSpan?: number;
}) {
  return (
    <th
      rowSpan={rowSpan}
      colSpan={colSpan}
      className="border border-slate-100 px-2 py-2 text-[11px] font-semibold whitespace-nowrap"
    >
      {children}
    </th>
  );
}

function FieldCell({
  value,
  field,
  onChangeLocal,
  onCommit,
}: {
  value: string;
  field: FieldConfig;
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
        value={value}
        onChange={(e) => {
          onChangeLocal(e.target.value);
          onCommit(e.target.value);
        }}
        className="w-full min-w-[92px] rounded border-none bg-transparent px-1 py-1 text-xs outline-none focus:bg-blue-50"
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
        type="date"
        value={value}
        onChange={(e) => {
          onChangeLocal(e.target.value);
          onCommit(e.target.value);
        }}
        className="w-full min-w-[124px] rounded border-none bg-transparent px-1 py-1 text-xs outline-none focus:bg-blue-50"
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChangeLocal(e.target.value)}
      onBlur={(e) => onCommit(e.target.value)}
      className={`w-full rounded border-none bg-transparent px-1 py-1 text-xs outline-none focus:bg-blue-50 ${
        field.wide ? "min-w-[220px]" : "min-w-[96px]"
      }`}
    />
  );
}
