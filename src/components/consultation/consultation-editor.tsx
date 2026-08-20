"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addApplicationRowAction, deleteApplicationRowAction, updateApplicationFieldAction } from "@/app/actions";
import { ChecklistPanel } from "@/components/checklist-panel";
import { ADMISSION_TYPES, MAX_APPLICATION_ROWS, type Application, type ApplicationPatch, type ChecklistItem } from "@/lib/types";
import {
  CONSULTATION_FIELD_METADATA,
  type ConsultationFieldMetadata,
  type ConsultationStage,
} from "@/lib/consultation/field-metadata";
import { ConsultationSaveStatus, ConsultationStageNavigation, type ConsultationSaveState } from "./consultation-components";

type EditableField = keyof ApplicationPatch;
type FieldStatus = { state: ConsultationSaveState; message?: string };
type EditorField = Pick<ConsultationFieldMetadata, "label" | "format"> & { field: EditableField };
type ConsultationEditableField = ConsultationFieldMetadata["field"] & EditableField;
const SAVE_DELAY_MS = 700;

const FIRST_CONSULTATION_SECTIONS = {
  conditions: ["admission_method", "csat_min_grade"],
  grades: ["my_grade", "prev_avg_grade", "first_pass_cut", "cut_70", "additional_pass_cut"],
  currentResults: ["result_2026_cut_50", "result_2026_cut_70", "result_2026_competition_rate", "result_2026_additional_admits"],
  previousResults: CONSULTATION_FIELD_METADATA.filter((metadata) =>
    metadata.stage === "first_consultation" &&
    metadata.section === "yearly_result" &&
    !metadata.field.startsWith("result_2026_")
  ).map((metadata) => metadata.field),
} as const satisfies Record<string, readonly ConsultationEditableField[]>;

const SECOND_CONSULTATION_FIELDS = {
  schedules: ["apply_period_text", "document_submit_period_text", "stage1_announce_text", "interview_schedule_text", "final_announce_text"],
} as const satisfies Record<string, readonly ConsultationEditableField[]>;

const LEGACY_DATE_FIELDS: readonly EditorField[] = [
  { field: "apply_start_date", label: "원서접수일", format: "text" },
  { field: "document_submit_date", label: "서류제출일", format: "text" },
  { field: "stage1_announce_date", label: "1단계 발표일", format: "text" },
  { field: "interview_date", label: "전형일(면접)", format: "text" },
  { field: "final_announce_date", label: "최종 발표일", format: "text" },
] as const;

const LEGACY_FIELDS: readonly EditorField[] = [
  { field: "region", label: "지역", format: "text" },
  { field: "prev_recruit_count", label: "전년도 모집인원", format: "text" },
  { field: "major_series", label: "계열", format: "text" },
  { field: "stage1_elements", label: "1단계 요소", format: "text" },
  { field: "season", label: "시기", format: "text" },
  { field: "selection_type", label: "선발유형", format: "text" },
  { field: "my_score", label: "나의 점수", format: "text" },
] as const;

export function ConsultationEditor({ studentId, initialApplications, initialChecklist, onApplicationsChange }: {
  studentId: string;
  initialApplications: Application[];
  initialChecklist: ChecklistItem[];
  onApplicationsChange?: (applications: Application[]) => void;
}) {
  const router = useRouter();
  const [isMutating, startMutation] = useTransition();
  const [applications, setApplications] = useState(initialApplications);
  const [selectedId, setSelectedId] = useState(initialApplications[0]?.id ?? "");
  const [stage, setStage] = useState<ConsultationStage>("common");
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({});
  const [mutationError, setMutationError] = useState("");
  const valuesRef = useRef(new Map<string, string>());
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const inFlightRef = useRef(new Set<string>());
  const mountedRef = useRef(true);
  const onApplicationsChangeRef = useRef(onApplicationsChange);
  onApplicationsChangeRef.current = onApplicationsChange;

  useEffect(() => {
    setApplications(initialApplications);
    setSelectedId((current) => initialApplications.some((item) => item.id === current) ? current : initialApplications[0]?.id ?? "");
  }, [initialApplications]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (valuesRef.current.size === 0 && inFlightRef.current.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    const values = valuesRef.current;
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      for (const key of Array.from(values.keys())) {
        const separator = key.indexOf(":");
        requestSave(key.slice(0, separator), key.slice(separator + 1) as EditableField);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = applications.find((application) => application.id === selectedId);
  const stageFields = useMemo(() => CONSULTATION_FIELD_METADATA.filter((field) => field.stage === stage), [stage]);
  const selectedPrefix = selected ? `${selected.id}:` : "";
  const selectedStates = Object.entries(statuses).filter(([key]) => key.startsWith(selectedPrefix)).map(([, value]) => value.state);
  const overallState: ConsultationSaveState = selectedStates.includes("error") ? "error" : selectedStates.includes("saving") ? "saving" : selectedStates.includes("dirty") ? "dirty" : selectedStates.includes("saved") ? "saved" : "idle";
  const fieldKey = (applicationId: string, field: EditableField) => `${applicationId}:${field}`;

  function publish(next: Application[]) {
    setApplications(next);
    onApplicationsChangeRef.current?.(next);
  }

  function setFieldStatus(key: string, status: FieldStatus) {
    if (mountedRef.current) setStatuses((current) => ({ ...current, [key]: status }));
  }

  function updateLocal(applicationId: string, field: EditableField, value: string) {
    const key = fieldKey(applicationId, field);
    valuesRef.current.set(key, value);
    setApplications((current) => current.map((item) => item.id === applicationId ? { ...item, [field]: value } : item));
    setFieldStatus(key, { state: "dirty" });
  }

  function mergeServerRow(applicationId: string, updated: Application) {
    const merged = { ...updated } as Application;
    for (const [pendingKey, pendingValue] of valuesRef.current) {
      const separator = pendingKey.indexOf(":");
      if (pendingKey.slice(0, separator) !== applicationId) continue;
      const pendingField = pendingKey.slice(separator + 1) as EditableField;
      (merged as unknown as Record<EditableField, string | null>)[pendingField] = pendingValue;
    }
    return merged;
  }

  function requestSave(applicationId: string, field: EditableField) {
    const key = fieldKey(applicationId, field);
    if (inFlightRef.current.has(key)) return;
    const value = valuesRef.current.get(key);
    if (value === undefined) return;
    void runSave(applicationId, field, key, value);
  }

  async function runSave(applicationId: string, field: EditableField, key: string, value: string) {
    inFlightRef.current.add(key);
    setFieldStatus(key, { state: "saving" });
    try {
      const updated = await updateApplicationFieldAction(null, applicationId, field, value);
      inFlightRef.current.delete(key);
      const isLatest = valuesRef.current.get(key) === value;
      if (isLatest) valuesRef.current.delete(key);
      if (mountedRef.current) {
        setApplications((current) => {
          const next = current.map((item) => item.id === applicationId ? mergeServerRow(applicationId, updated) : item);
          onApplicationsChangeRef.current?.(next);
          return next;
        });
      }
      if (isLatest) setFieldStatus(key, { state: "saved" });
      else requestSave(applicationId, field);
    } catch {
      inFlightRef.current.delete(key);
      if (valuesRef.current.get(key) === value) setFieldStatus(key, { state: "error", message: "저장하지 못했습니다. 다시 시도해 주세요." });
      else requestSave(applicationId, field);
    }
  }

  function flushField(applicationId: string, field: EditableField) {
    const key = fieldKey(applicationId, field);
    const timer = timersRef.current.get(key);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(key);
    requestSave(applicationId, field);
  }

  function handleChange(applicationId: string, metadata: EditorField, value: string) {
    updateLocal(applicationId, metadata.field, value);
    const key = fieldKey(applicationId, metadata.field);
    const previous = timersRef.current.get(key);
    if (previous) clearTimeout(previous);
    if (metadata.format === "select") requestSave(applicationId, metadata.field);
    else timersRef.current.set(key, setTimeout(() => { timersRef.current.delete(key); requestSave(applicationId, metadata.field); }, SAVE_DELAY_MS));
  }

  function flushApplication(applicationId: string) {
    const prefix = `${applicationId}:`;
    for (const [key, timer] of Array.from(timersRef.current.entries())) {
      if (!key.startsWith(prefix)) continue;
      clearTimeout(timer);
      timersRef.current.delete(key);
      requestSave(applicationId, key.slice(prefix.length) as EditableField);
    }
  }

  function handleSelectApplication(nextId: string) {
    if (selected && selected.id !== nextId) {
      const hasError = Object.entries(statuses).some(([key, status]) => key.startsWith(`${selected.id}:`) && status.state === "error");
      if (hasError && !window.confirm(`${selected.university_name.trim() || "현재 지원대학"}에 저장하지 못한 항목이 있습니다. 그래도 이동할까요?`)) return;
      flushApplication(selected.id);
    }
    setSelectedId(nextId);
  }

  function addApplication() {
    setMutationError("");
    startMutation(async () => {
      try {
        const row = await addApplicationRowAction(null, studentId);
        const next = [...applications, row];
        publish(next);
        setSelectedId(row.id);
        setStage("common");
        router.refresh();
      } catch { setMutationError("지원대학을 추가하지 못했습니다."); }
    });
  }

  function deleteApplication() {
    if (!selected || !window.confirm(`${selected.university_name.trim() || `${selected.seq}번 지원대학`} 정보를 삭제할까요?`)) return;
    setMutationError("");
    startMutation(async () => {
      try {
        await deleteApplicationRowAction(null, selected.id);
        const next = applications.filter((item) => item.id !== selected.id).map((item, index) => ({ ...item, seq: index + 1 }));
        publish(next);
        setSelectedId(next[0]?.id ?? "");
        router.refresh();
      } catch { setMutationError("지원대학을 삭제하지 못했습니다."); }
    });
  }

  return <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside className="min-w-0 rounded-xl border border-line bg-white p-4 shadow-card" aria-label="지원대학 목록">
      <h2 className="font-bold text-navy">지원대학 목록</h2>
      <div className="mt-3 grid max-h-[560px] gap-2 overflow-y-auto pr-1">
        {applications.map((application) => <button key={application.id} type="button" aria-pressed={selectedId === application.id} onClick={() => handleSelectApplication(application.id)} className={`min-h-16 rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selectedId === application.id ? "border-navy bg-navy text-white shadow-sm" : "border-line bg-white text-slate-700 hover:border-brand hover:bg-blue-50"}`}>
          <span className="block truncate text-sm font-bold">{application.seq}. {application.university_name.trim() || "대학 미입력"}</span>
          <span className={`mt-1 block truncate text-xs ${selectedId === application.id ? "text-blue-100" : "text-muted"}`}>{application.department.trim() || "학과 미입력"}{application.admission_type.trim() ? ` · ${application.admission_type}` : ""}</span>
        </button>)}
      </div>
      <button type="button" onClick={addApplication} disabled={isMutating || applications.length >= MAX_APPLICATION_ROWS} className="mt-4 min-h-11 w-full rounded-lg border border-brand bg-white px-4 text-sm font-bold text-brand hover:bg-blue-50 disabled:opacity-50">+ 지원대학 추가</button>
      {mutationError && <p role="alert" className="mt-2 text-xs text-red-700">{mutationError}</p>}
    </aside>

    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-white shadow-card">
      {!selected ? <div className="p-8 text-center text-sm text-muted">지원대학을 추가하면 상담 정보를 입력할 수 있습니다.</div> : <>
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-5">
          <div className="min-w-0"><h2 className="truncate text-xl font-bold text-navy sm:text-2xl">{selected.university_name.trim() || "대학 미입력"}{selected.department.trim() ? ` · ${selected.department}` : ""}</h2><p className="mt-1 truncate text-sm text-muted">{selected.admission_type || "전형유형 미입력"}{selected.admission_name ? ` / ${selected.admission_name}` : ""}</p></div>
          <div className="flex items-center gap-2">{overallState === "idle" || overallState === "saved" ? <p role="status" aria-live="polite" className="text-sm font-semibold text-emerald-700">● 모든 변경사항 저장됨</p> : <ConsultationSaveStatus state={overallState} />}<button type="button" onClick={deleteApplication} disabled={isMutating} className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold text-slate-600 hover:border-red-300 hover:text-red-700">삭제</button></div>
        </header>
        <div className="px-5 pt-2"><ConsultationStageNavigation current={stage} onChange={setStage} /></div>
        <div className="p-5">
          {stage === "first_consultation" ? <FirstConsultationWorkspace fields={stageFields} application={selected} statuses={statuses} fieldKey={fieldKey} onChange={handleChange} onBlur={flushField} onRetry={flushField} /> : stage === "second_consultation" ? <SecondConsultationWorkspace fields={stageFields} application={selected} applications={applications} initialChecklist={initialChecklist} statuses={statuses} fieldKey={fieldKey} onChange={handleChange} onBlur={flushField} onRetry={flushField} /> : <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
            {stageFields.map((metadata) => <ConsultationInputField key={metadata.field} metadata={metadata} value={String(selected[metadata.field] ?? "")} status={statuses[fieldKey(selected.id, metadata.field)] ?? { state: "idle" }} onChange={(value) => handleChange(selected.id, metadata, value)} onBlur={() => flushField(selected.id, metadata.field)} onRetry={() => flushField(selected.id, metadata.field)} />)}
          </div>}
          {stage === "common" && <details className="mt-7 rounded-lg border border-line bg-subtle/50"><summary className="cursor-pointer px-4 py-3 text-sm font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">추가정보</summary><div className="grid gap-x-7 gap-y-5 border-t border-line p-4 sm:grid-cols-2">{LEGACY_FIELDS.map((metadata) => <ConsultationInputField key={metadata.field} metadata={metadata} value={String(selected[metadata.field] ?? "")} status={statuses[fieldKey(selected.id, metadata.field)] ?? { state: "idle" }} onChange={(value) => handleChange(selected.id, metadata, value)} onBlur={() => flushField(selected.id, metadata.field)} onRetry={() => flushField(selected.id, metadata.field)} />)}</div></details>}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle/40 px-5 py-4"><p className="text-sm text-muted">☁ 입력 내용은 자동 저장됩니다</p>{stage === "common" && <button type="button" onClick={() => setStage("first_consultation")} className="min-h-11 rounded-lg border border-brand bg-white px-5 text-sm font-bold text-brand hover:bg-blue-50">다음: 1차 상담 →</button>}{stage === "first_consultation" && <button type="button" onClick={() => setStage("second_consultation")} className="min-h-11 rounded-lg border border-brand bg-white px-5 text-sm font-bold text-brand hover:bg-blue-50">다음: 2차 상담 →</button>}{stage === "second_consultation" && <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStage("first_consultation")} className="min-h-11 rounded-lg px-4 text-sm font-bold text-brand hover:bg-blue-50">← 1차 상담</button><button type="button" onClick={() => setStage("memo")} className="min-h-11 rounded-lg border border-brand bg-white px-5 text-sm font-bold text-brand hover:bg-blue-50">다음: 메모·비고 →</button></div>}</footer>
      </>}
    </section>
  </div>;
}

function FirstConsultationWorkspace({ fields, application, statuses, fieldKey, onChange, onBlur, onRetry }: {
  fields: readonly ConsultationFieldMetadata[];
  application: Application;
  statuses: Record<string, FieldStatus>;
  fieldKey: (applicationId: string, field: EditableField) => string;
  onChange: (applicationId: string, metadata: EditorField, value: string) => void;
  onBlur: (applicationId: string, field: EditableField) => void;
  onRetry: (applicationId: string, field: EditableField) => void;
}) {
  const metadataByField = new Map(fields.map((metadata) => [metadata.field, metadata]));
  const renderField = (field: ConsultationEditableField) => {
    const metadata = metadataByField.get(field);
    if (!metadata) return null;
    return <ConsultationInputField key={field} metadata={metadata} value={String(application[field] ?? "")} placeholder={field.startsWith("result_") ? "미입력" : undefined} status={statuses[fieldKey(application.id, field)] ?? { state: "idle" }} onChange={(value) => onChange(application.id, metadata, value)} onBlur={() => onBlur(application.id, field)} onRetry={() => onRetry(application.id, field)} />;
  };

  return <div className="space-y-7">
    <ConsultationSection number="1" title="상담 핵심 조건">
      <div className="grid gap-x-7 gap-y-5 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">{FIRST_CONSULTATION_SECTIONS.conditions.map(renderField)}</div>
    </ConsultationSection>
    <ConsultationSection number="2" title="학생 성적 · 참고 입결">
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-5">{FIRST_CONSULTATION_SECTIONS.grades.map(renderField)}</div>
      <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">ⓘ 전년도 참고 입결은 연도별 입결과 별도로 관리됩니다.</p>
    </ConsultationSection>
    <ConsultationSection number="3" title="2026 최신 입결">
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold text-navy">2026학년도</h4><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand shadow-sm">최신 기준</span></div>
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">{FIRST_CONSULTATION_SECTIONS.currentResults.map(renderField)}</div>
      </div>
    </ConsultationSection>
    <details className="rounded-xl border border-line bg-subtle/40">
      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">이전 연도 입결 (2023~2025)</summary>
      <div className="border-t border-line p-4"><div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">{FIRST_CONSULTATION_SECTIONS.previousResults.map(renderField)}</div><p className="mt-4 text-xs leading-5 text-muted">경쟁률·등급·인원은 입력한 원문 형식 그대로 저장됩니다.</p></div>
    </details>
  </div>;
}

function SecondConsultationWorkspace({ fields, application, applications, initialChecklist, statuses, fieldKey, onChange, onBlur, onRetry }: {
  fields: readonly ConsultationFieldMetadata[];
  application: Application;
  applications: Application[];
  initialChecklist: ChecklistItem[];
  statuses: Record<string, FieldStatus>;
  fieldKey: (applicationId: string, field: EditableField) => string;
  onChange: (applicationId: string, metadata: EditorField, value: string) => void;
  onBlur: (applicationId: string, field: EditableField) => void;
  onRetry: (applicationId: string, field: EditableField) => void;
}) {
  const metadataByField = new Map(fields.map((metadata) => [metadata.field, metadata]));
  const renderLegacyDate = (metadata: EditorField) => <ConsultationInputField key={metadata.field} metadata={metadata} value={String(application[metadata.field] ?? "")} status={statuses[fieldKey(application.id, metadata.field)] ?? { state: "idle" }} onChange={(value) => onChange(application.id, metadata, value)} onBlur={() => onBlur(application.id, metadata.field)} onRetry={() => onRetry(application.id, metadata.field)} />;
  const renderSchedule = (field: ConsultationEditableField, index: number) => {
    const metadata = metadataByField.get(field);
    if (!metadata) return null;
    return <div key={field} className="min-w-0 rounded-xl border border-line bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand text-xs font-bold text-brand">{index + 1}</span>
        <h4 className="text-sm font-bold text-navy">{metadata.label}</h4>
      </div>
      <ConsultationInputField metadata={{ ...metadata, label: `${metadata.label} 입력`, format: "text" }} value={String(application[field] ?? "")} placeholder="일정·시간 입력" status={statuses[fieldKey(application.id, field)] ?? { state: "idle" }} onChange={(value) => onChange(application.id, metadata, value)} onBlur={() => onBlur(application.id, field)} onRetry={() => onRetry(application.id, field)} />
    </div>;
  };

  return <div className="space-y-7">
    <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3"><h3 className="font-bold text-navy">2차 상담 준비</h3><p className="mt-1 text-sm leading-6 text-blue-900">실제 원서접수에 필요한 제출서류와 주요 일정을 진행 순서대로 확인합니다.</p></div>
    <ConsultationSection number="1" title="제출서류">
      <ChecklistPanel applications={applications} initialItems={initialChecklist} selectedApplicationId={application.id} />
      {application.required_documents.trim() && <details className="mt-4 rounded-lg border border-line bg-subtle/50"><summary className="cursor-pointer px-4 py-3 text-sm font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">기존 제출서류 메모</summary><p className="whitespace-pre-wrap break-words border-t border-line px-4 py-3 text-sm leading-6 text-slate-700">{application.required_documents}</p></details>}
    </ConsultationSection>
    <ConsultationSection number="2" title="주요 원서 일정">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{SECOND_CONSULTATION_FIELDS.schedules.map(renderSchedule)}</div>
      <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">ⓘ 날짜·기간·시간·추가 설명은 입력한 원문 형식 그대로 저장됩니다.</p>
    </ConsultationSection>
    <details className="rounded-xl border border-line bg-subtle/40"><summary className="cursor-pointer px-4 py-3 text-sm font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">기존 날짜 정보</summary><div className="border-t border-line p-4"><p className="mb-4 text-xs leading-5 text-muted">기존에 저장된 날짜 값을 보존하기 위한 참고 영역입니다. 위 주요 일정과 자동으로 연결되거나 변환되지 않습니다.</p><div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">{LEGACY_DATE_FIELDS.map(renderLegacyDate)}</div></div></details>
  </div>;
}

function ConsultationSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section aria-labelledby={`first-consultation-section-${number}`}><h3 id={`first-consultation-section-${number}`} className="mb-4 text-base font-bold text-navy">{number}. {title}</h3>{children}</section>;
}

function ConsultationInputField({ metadata, value, placeholder, fullWidth, status, onChange, onBlur, onRetry }: { metadata: EditorField; value: string; placeholder?: string; fullWidth?: boolean; status: FieldStatus; onChange: (value: string) => void; onBlur: () => void; onRetry: () => void }) {
  const id = `consultation-${metadata.field}`;
  const controlClass = "mt-2 min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  const isMultiline = metadata.format === "multiline" || metadata.format === "schedule";
  const options = value && !(ADMISSION_TYPES as readonly string[]).includes(value) ? [value, ...ADMISSION_TYPES] : ADMISSION_TYPES;
  return <div className={`min-w-0 ${(fullWidth ?? isMultiline) ? "sm:col-span-2" : ""}`}><label htmlFor={id} className="text-sm font-semibold text-slate-700">{metadata.label}</label>{metadata.format === "select" ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}><option value="">선택</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : isMultiline ? <textarea id={id} value={value} rows={metadata.format === "schedule" ? 4 : 3} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className={`${controlClass} resize-y whitespace-pre-wrap`} /> : <input id={id} type={metadata.field.toString().endsWith("_date") ? "date" : "text"} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className={controlClass} />}<div className="mt-1 flex min-h-8 items-center justify-between gap-2"><ConsultationSaveStatus state={status.state} />{status.state === "error" && <button type="button" onClick={onRetry} className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700">다시 시도</button>}</div>{status.message && <p role="alert" className="text-xs text-red-700">{status.message}</p>}</div>;
}
