"use client";

import type { ReactNode } from "react";
import type { Application, Student } from "@/lib/types";
import { CONSULTATION_STAGE_LABELS, displayConsultationValue, type ConsultationStage } from "@/lib/consultation/field-metadata";
import { cx } from "@/lib/ui";

export function ConsultationStageNavigation({ current, onChange }: { current: ConsultationStage; onChange: (stage: ConsultationStage) => void }) {
  const stages = Object.keys(CONSULTATION_STAGE_LABELS) as ConsultationStage[];
  return <nav aria-label="상담 단계" className="overflow-x-auto"><div className="flex min-w-max gap-1 border-b border-line">{stages.map((stage) => <button key={stage} type="button" aria-current={current === stage ? "step" : undefined} onClick={() => onChange(stage)} className={cx("min-h-11 border-b-2 px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset", current === stage ? "border-brand text-brand" : "border-transparent text-muted hover:text-navy")}>{CONSULTATION_STAGE_LABELS[stage]}</button>)}</div></nav>;
}

export function ConsultationStudentIdentity({ student, className }: { student: Pick<Student, "name" | "student_number">; className: string }) {
  return <header className="rounded-xl border border-line bg-white px-4 py-3 shadow-card" aria-label="현재 상담 학생"><p className="text-xs font-semibold text-brand">{className}</p><div className="mt-1 flex flex-wrap items-baseline gap-x-2"><h2 className="text-lg font-bold text-navy">{student.name}</h2><p className="text-sm text-muted">학번 {student.student_number || "-"}</p></div></header>;
}

export function ConsultationInfoGrid({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <dl aria-label={label} className={cx("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>{children}</dl>;
}

export function ConsultationReadOnlyField({ label, value, emptyDisplay = "dash", className }: { label: string; value: string | null | undefined; emptyDisplay?: "dash" | "not-entered"; className?: string }) {
  return <div className={cx("min-w-0 rounded-xl border border-line bg-white p-4", className)}><dt className="text-xs font-semibold text-muted">{label}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-6 text-foreground">{displayConsultationValue(value, emptyDisplay)}</dd></div>;
}

const RESULT_METRICS = [
  ["cut_50", "50% 컷"], ["cut_70", "70% 컷"], ["competition_rate", "경쟁률"], ["additional_admits", "추가합격 인원"],
] as const;
const YEARS_ASC = [2023, 2024, 2025, 2026] as const;
const YEARS_DESC = [2026, 2025, 2024, 2023] as const;
type ResultField = `result_${(typeof YEARS_ASC)[number]}_${(typeof RESULT_METRICS)[number][0]}`;

export function ConsultationResultComparison({ application, title = "2023~2026 입결 비교" }: { application: Application; title?: string }) {
  return <section aria-labelledby="consultation-results-title"><h3 id="consultation-results-title" className="text-base font-bold text-navy">{title}</h3><p className="mt-1 text-xs text-muted">추가합격 인원은 레거시 추가합격 성적 컷과 다른 정보입니다.</p>
    <div className="mt-3 hidden overflow-x-auto md:block"><table className="w-full min-w-[680px] border-collapse text-sm"><caption className="sr-only">연도별 50% 컷, 70% 컷, 경쟁률, 추가합격 인원 비교</caption><thead><tr><th scope="col" className="border border-line bg-subtle px-3 py-3 text-left">연도</th>{RESULT_METRICS.map(([, label]) => <th key={label} scope="col" className="border border-line bg-subtle px-3 py-3 text-left">{label}</th>)}</tr></thead><tbody>{YEARS_ASC.map((year) => <tr key={year}><th scope="row" className="border border-line px-3 py-3 text-left font-bold text-navy">{year}</th>{RESULT_METRICS.map(([metric]) => { const field = `result_${year}_${metric}` as ResultField; return <td key={metric} className="whitespace-pre-wrap break-words border border-line px-3 py-3">{displayConsultationValue(application[field])}</td>; })}</tr>)}</tbody></table></div>
    <div className="mt-3 grid gap-3 md:hidden">{YEARS_DESC.map((year, index) => <details key={year} open={index === 0} className="group rounded-xl border border-line bg-white"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span>{year}년 입결</span><span aria-hidden="true" className="text-muted group-open:rotate-180">⌄</span></summary><dl className="grid grid-cols-2 gap-px border-t border-line bg-line">{RESULT_METRICS.map(([metric, label]) => { const field = `result_${year}_${metric}` as ResultField; return <div key={metric} className="min-w-0 bg-white p-3"><dt className="text-xs font-semibold text-muted">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">{displayConsultationValue(application[field])}</dd></div>; })}</dl></details>)}</div>
  </section>;
}

const SCHEDULE_FIELDS = [
  ["apply_period_text", "원서접수 기간"], ["document_submit_period_text", "서류 제출 기간"], ["stage1_announce_text", "1단계 발표"], ["interview_schedule_text", "면접 일정"], ["final_announce_text", "최종 발표"],
] as const;

export function ConsultationScheduleList({ application, title = "원서접수·전형 일정" }: { application: Application; title?: string }) {
  return <section aria-labelledby="consultation-schedule-title"><h3 id="consultation-schedule-title" className="text-base font-bold text-navy">{title}</h3><dl className="mt-3 grid gap-3">{SCHEDULE_FIELDS.map(([field, label]) => <ConsultationScheduleItem key={field} label={label} value={application[field]} />)}</dl></section>;
}

export function ConsultationScheduleItem({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="grid gap-1 rounded-xl border border-line bg-white p-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"><dt className="text-sm font-semibold text-navy">{label}</dt><dd className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{displayConsultationValue(value, "not-entered")}</dd></div>;
}

export type ConsultationSaveState = "idle" | "dirty" | "saving" | "saved" | "error";
const SAVE_STATUS: Record<ConsultationSaveState, { label: string; className: string }> = {
  idle: { label: "변경사항 없음", className: "text-muted" }, dirty: { label: "저장되지 않은 변경사항", className: "text-amber-700" }, saving: { label: "저장 중…", className: "text-brand" }, saved: { label: "저장 완료", className: "text-emerald-700" }, error: { label: "저장 실패", className: "text-red-700" },
};

export function ConsultationSaveStatus({ state }: { state: ConsultationSaveState }) {
  const status = SAVE_STATUS[state];
  return <p role="status" aria-live={state === "error" ? "assertive" : "polite"} aria-atomic="true" className={cx("inline-flex min-h-8 items-center gap-2 text-sm font-semibold", status.className)}><span aria-hidden="true">{state === "saving" ? "…" : state === "saved" ? "✓" : state === "error" ? "!" : "•"}</span>{status.label}</p>;
}
