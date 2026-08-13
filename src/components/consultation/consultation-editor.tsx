"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { updateApplicationFieldAction } from "@/app/actions";
import { ADMISSION_TYPES, type Application, type Student } from "@/lib/types";
import {
  CONSULTATION_FIELD_METADATA,
  CONSULTATION_STAGE_LABELS,
  type ConsultationFieldMetadata,
  type ConsultationFieldName,
  type ConsultationStage,
} from "@/lib/consultation/field-metadata";
import {
  ConsultationSaveStatus,
  ConsultationStageNavigation,
  ConsultationStudentIdentity,
  type ConsultationSaveState,
} from "./consultation-components";

type FieldStatus = { state: ConsultationSaveState; message?: string };
const SAVE_DELAY_MS = 700;

export function ConsultationEditor({ student, className, initialApplications, onApplicationsChange }: {
  student: Pick<Student, "name" | "student_number">;
  className: string;
  initialApplications: Application[];
  onApplicationsChange?: (applications: Application[]) => void;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedId, setSelectedId] = useState(initialApplications[0]?.id ?? "");
  const [stage, setStage] = useState<ConsultationStage>("common");
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({});
  // Holds the latest value the user wants persisted per field key; an entry is
  // removed only once that exact value has been confirmed saved to the server.
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
      // Flush anything still unsaved so navigating away doesn't silently drop it.
      for (const key of Array.from(values.keys())) {
        const [applicationId, field] = key.split(":") as [string, ConsultationFieldName];
        requestSave(applicationId, field);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = applications.find((application) => application.id === selectedId);
  const fields = useMemo(() => CONSULTATION_FIELD_METADATA.filter((field) => field.stage === stage), [stage]);
  const fieldKey = (applicationId: string, field: ConsultationFieldName) => `${applicationId}:${field}`;

  function setFieldStatus(key: string, status: FieldStatus) {
    if (!mountedRef.current) return;
    setStatuses((current) => ({ ...current, [key]: status }));
  }

  function updateLocal(applicationId: string, field: ConsultationFieldName, value: string) {
    const key = fieldKey(applicationId, field);
    valuesRef.current.set(key, value);
    setApplications((current) => current.map((item) => item.id === applicationId ? { ...item, [field]: value } : item));
    setFieldStatus(key, { state: "dirty" });
  }

  // Folds a fresh server row into local state without clobbering any other
  // field of the same application that is still pending/unsaved locally.
  function mergeServerRow(applicationId: string, updated: Application): Application {
    const merged: Application = { ...updated };
    for (const [pendingKey, pendingValue] of valuesRef.current) {
      const separator = pendingKey.indexOf(":");
      const pendingAppId = pendingKey.slice(0, separator);
      if (pendingAppId !== applicationId) continue;
      const pendingField = pendingKey.slice(separator + 1) as ConsultationFieldName;
      (merged as Record<ConsultationFieldName, string | null>)[pendingField] = pendingValue;
    }
    return merged;
  }

  function requestSave(applicationId: string, field: ConsultationFieldName) {
    const key = fieldKey(applicationId, field);
    if (inFlightRef.current.has(key)) return; // a request is already running; it will pick up the latest value on completion
    const value = valuesRef.current.get(key);
    if (value === undefined) return; // nothing pending
    void runSave(applicationId, field, key, value);
  }

  async function runSave(applicationId: string, field: ConsultationFieldName, key: string, value: string) {
    inFlightRef.current.add(key);
    setFieldStatus(key, { state: "saving" });
    try {
      const updated = await updateApplicationFieldAction(null, applicationId, field, value);
      inFlightRef.current.delete(key);
      const isLatest = valuesRef.current.get(key) === value;
      if (isLatest) valuesRef.current.delete(key);
      if (mountedRef.current) {
        setApplications((current) => {
          const nextApplications = current.map((item) => item.id === applicationId ? mergeServerRow(applicationId, updated) : item);
          onApplicationsChangeRef.current?.(nextApplications);
          return nextApplications;
        });
      }
      if (isLatest) setFieldStatus(key, { state: "saved" });
      else requestSave(applicationId, field); // a newer value arrived while this request was in flight
    } catch {
      inFlightRef.current.delete(key);
      const isLatest = valuesRef.current.get(key) === value;
      if (isLatest) setFieldStatus(key, { state: "error", message: "저장하지 못했습니다. 입력값을 확인하고 다시 시도해 주세요." });
      else requestSave(applicationId, field);
    }
  }

  function flushField(applicationId: string, field: ConsultationFieldName) {
    const key = fieldKey(applicationId, field);
    const timer = timersRef.current.get(key);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(key);
    }
    requestSave(applicationId, field);
  }

  function scheduleSave(applicationId: string, metadata: ConsultationFieldMetadata) {
    const key = fieldKey(applicationId, metadata.field);
    const previous = timersRef.current.get(key);
    if (previous) clearTimeout(previous);
    if (metadata.format === "select") {
      timersRef.current.delete(key);
      requestSave(applicationId, metadata.field);
      return;
    }
    timersRef.current.set(key, setTimeout(() => {
      timersRef.current.delete(key);
      requestSave(applicationId, metadata.field);
    }, SAVE_DELAY_MS));
  }

  function handleChange(applicationId: string, metadata: ConsultationFieldMetadata, value: string) {
    updateLocal(applicationId, metadata.field, value);
    scheduleSave(applicationId, metadata);
  }

  function handleSelectApplication(nextId: string) {
    if (selected && selected.id !== nextId) {
      const prefix = `${selected.id}:`;
      const hasError = Object.entries(statuses).some(([key, status]) => key.startsWith(prefix) && status.state === "error");
      if (hasError) {
        const proceed = window.confirm(`${selected.university_name.trim() || "현재 지원대학"}에 저장하지 못한 항목이 있습니다. 그래도 다른 지원대학으로 이동할까요?`);
        if (!proceed) return;
      }
      for (const [key, timer] of Array.from(timersRef.current.entries())) {
        if (!key.startsWith(prefix)) continue;
        clearTimeout(timer);
        timersRef.current.delete(key);
        const field = key.slice(prefix.length) as ConsultationFieldName;
        requestSave(selected.id, field);
      }
    }
    setSelectedId(nextId);
  }

  return <div className="grid gap-5">
    <ConsultationStudentIdentity student={student} className={className} />
    {applications.length === 0 ? <p className="rounded-xl border border-dashed border-line bg-subtle p-6 text-sm text-muted">상담 정보를 입력하려면 먼저 지원대학을 추가해 주세요.</p> : <>
      <div className="overflow-x-auto" aria-label="상담할 지원대학 선택"><div className="flex min-w-max gap-2">
        {applications.map((application) => <button key={application.id} type="button" aria-pressed={selectedId === application.id} onClick={() => handleSelectApplication(application.id)} className={`min-h-11 rounded-lg border px-4 py-2 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selectedId === application.id ? "border-brand bg-brand text-white" : "border-line bg-white text-navy hover:bg-subtle"}`}>{application.seq}. {application.university_name.trim() || "대학 미입력"}</button>)}
      </div></div>
      <ConsultationStageNavigation current={stage} onChange={setStage} />
      {selected && <section aria-labelledby="consultation-stage-heading" className="grid gap-4">
        <div><h3 id="consultation-stage-heading" className="text-lg font-bold text-navy">{CONSULTATION_STAGE_LABELS[stage]}</h3><p className="mt-1 text-sm text-muted">입력 후 잠시 기다리면 필드별로 자동 저장됩니다.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((metadata) => {
            const key = fieldKey(selected.id, metadata.field);
            const value = String(selected[metadata.field] ?? "");
            return <ConsultationInputField key={metadata.field} metadata={metadata} value={value} status={statuses[key] ?? { state: "idle" }} onChange={(next) => handleChange(selected.id, metadata, next)} onBlur={() => flushField(selected.id, metadata.field)} onRetry={() => flushField(selected.id, metadata.field)} />;
          })}
        </div>
      </section>}
    </>}
  </div>;
}

function ConsultationInputField({ metadata, value, status, onChange, onBlur, onRetry }: {
  metadata: ConsultationFieldMetadata;
  value: string;
  status: FieldStatus;
  onChange: (value: string) => void;
  onBlur: () => void;
  onRetry: () => void;
}) {
  const id = `consultation-${metadata.field}`;
  const controlClass = "mt-2 min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  const isMultiline = metadata.format === "multiline" || metadata.format === "schedule";
  const options = value && !(ADMISSION_TYPES as readonly string[]).includes(value) ? [value, ...ADMISSION_TYPES] : ADMISSION_TYPES;
  return <div className={`min-w-0 rounded-xl border border-line bg-subtle/40 p-4 ${isMultiline ? "xl:col-span-2" : ""}`}>
    <label htmlFor={id} className="text-sm font-semibold text-navy">{metadata.label}</label>
    {metadata.format === "select" ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}><option value="">선택</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : isMultiline ? <textarea id={id} value={value} rows={metadata.format === "schedule" ? 4 : 3} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className={`${controlClass} resize-y whitespace-pre-wrap`} /> : <input id={id} type="text" value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className={controlClass} />}
    <div className="mt-2 flex min-h-9 flex-wrap items-center justify-between gap-2"><ConsultationSaveStatus state={status.state} />{status.state === "error" && <button type="button" onClick={onRetry} className="min-h-9 rounded-lg border border-red-300 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">다시 시도</button>}</div>
    {status.message && <p role="alert" className="mt-1 text-xs leading-5 text-red-700">{status.message}</p>}
  </div>;
}
