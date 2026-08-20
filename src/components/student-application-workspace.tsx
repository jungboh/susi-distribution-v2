"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addApplicationRowAction, deleteApplicationRowAction, updateApplicationFieldAction } from "@/app/actions";
import { ChecklistPanel } from "@/components/checklist-panel";
import { ADMISSION_TYPES, MAX_APPLICATION_ROWS, type Application, type ApplicationPatch, type ChecklistItem } from "@/lib/types";

type Tab = "basic" | "consultation" | "schedule" | "documents";
type EditableField = keyof ApplicationPatch;
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
type Status = { state: SaveState };
type Config = { field: EditableField; label: string; kind?: "select" | "textarea"; placeholder?: string };

const DELAY = 700;
const TABS: { id: Tab; label: string }[] = [
  { id: "basic", label: "기본정보" }, { id: "consultation", label: "상담정보" },
  { id: "schedule", label: "원서일정" }, { id: "documents", label: "제출서류" },
];
const BASIC: Config[] = [
  { field: "region", label: "지역" }, { field: "university_name", label: "지원대학" },
  { field: "department", label: "모집단위" }, { field: "admission_type", label: "전형유형", kind: "select" },
  { field: "admission_name", label: "전형명" }, { field: "recruit_count", label: "모집인원" },
];
const SCHEDULE: Config[] = [
  { field: "required_documents", label: "제출서류", kind: "textarea", placeholder: "필요한 제출서류를 입력해 주세요." },
  { field: "apply_period_text", label: "원서접수 일정", kind: "textarea" },
  { field: "document_submit_period_text", label: "서류제출 일정", kind: "textarea" },
  { field: "stage1_announce_text", label: "1단계 발표 일정", kind: "textarea" },
  { field: "interview_schedule_text", label: "면접 일정", kind: "textarea" },
  { field: "final_announce_text", label: "최종 발표 일정", kind: "textarea" },
];
const READ_ONLY: { field: keyof Application; label: string }[] = [
  { field: "admission_method", label: "전형방법" }, { field: "csat_min_grade", label: "수능 최저등급" },
  { field: "my_grade", label: "학생 성적" }, { field: "result_2026_cut_50", label: "2026 50% 컷" },
  { field: "result_2026_cut_70", label: "2026 70% 컷" }, { field: "result_2026_competition_rate", label: "2026 경쟁률" },
  { field: "result_2026_additional_admits", label: "2026 추가합격 인원" },
];

export function StudentApplicationWorkspace({ studentId, studentName, className, studentNumber, accessCode, initialApplications, initialChecklist }: {
  studentId: string; studentName: string; className: string; studentNumber: string | null; accessCode: string;
  initialApplications: Application[]; initialChecklist: ChecklistItem[];
}) {
  const router = useRouter();
  const [isMutating, startMutation] = useTransition();
  const [apps, setApps] = useState(initialApplications);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [selectedId, setSelectedId] = useState(initialApplications[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("basic");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [error, setError] = useState("");
  const values = useRef(new Map<string, string>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const inFlight = useRef(new Set<string>());
  const appsRef = useRef(initialApplications);

  useEffect(() => { appsRef.current = initialApplications; setApps(initialApplications); setSelectedId((id) => initialApplications.some((app) => app.id === id) ? id : initialApplications[0]?.id ?? ""); }, [initialApplications]);
  useEffect(() => setChecklist(initialChecklist), [initialChecklist]);
  useEffect(() => { const beforeUnload = (event: BeforeUnloadEvent) => { if (!values.current.size && !inFlight.current.size) return; event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", beforeUnload); return () => window.removeEventListener("beforeunload", beforeUnload); }, []);

  const selected = apps.find((app) => app.id === selectedId);
  const filledCount = apps.filter((app) => app.university_name.trim()).length;
  const scheduleCount = apps.reduce((sum, app) => sum + SCHEDULE.slice(1).filter(({ field }) => String(app[field] ?? "").trim()).length, 0);
  const keyOf = (id: string, field: EditableField) => `${id}:${field}`;
  const selectedStates = selected ? Object.entries(statuses).filter(([key]) => key.startsWith(`${selected.id}:`)).map(([, status]) => status.state) : [];
  const overall: SaveState = selectedStates.includes("error") ? "error" : selectedStates.includes("saving") ? "saving" : selectedStates.includes("dirty") ? "dirty" : selectedStates.includes("saved") ? "saved" : "idle";

  function publish(next: Application[]) { appsRef.current = next; setApps(next); }
  function change(id: string, config: Config, value: string) {
    const key = keyOf(id, config.field); values.current.set(key, value);
    publish(appsRef.current.map((app) => app.id === id ? { ...app, [config.field]: value } : app));
    setStatuses((current) => ({ ...current, [key]: { state: "dirty" } }));
    const previous = timers.current.get(key); if (previous) clearTimeout(previous);
    if (config.kind === "select") void save(id, config.field);
    else timers.current.set(key, setTimeout(() => { timers.current.delete(key); void save(id, config.field); }, DELAY));
  }
  async function save(id: string, field: EditableField) {
    const key = keyOf(id, field); if (inFlight.current.has(key)) return;
    const value = values.current.get(key); if (value === undefined) return;
    inFlight.current.add(key); setStatuses((current) => ({ ...current, [key]: { state: "saving" } }));
    try {
      const updated = await updateApplicationFieldAction(accessCode, id, field, value);
      inFlight.current.delete(key); const latest = values.current.get(key) === value; if (latest) values.current.delete(key);
      const merged = { ...updated } as Application;
      for (const [pendingKey, pendingValue] of values.current) if (pendingKey.startsWith(`${id}:`)) (merged as unknown as Record<string, string | null>)[pendingKey.slice(id.length + 1)] = pendingValue;
      publish(appsRef.current.map((app) => app.id === id ? merged : app));
      setStatuses((current) => ({ ...current, [key]: { state: latest ? "saved" : "dirty" } })); if (!latest) void save(id, field);
    } catch { inFlight.current.delete(key); setStatuses((current) => ({ ...current, [key]: { state: "error" } })); }
  }
  function flush(id: string, field: EditableField) { const key = keyOf(id, field); const timer = timers.current.get(key); if (timer) clearTimeout(timer); timers.current.delete(key); void save(id, field); }
  function flushApp(id: string) { for (const [key, timer] of Array.from(timers.current.entries())) if (key.startsWith(`${id}:`)) { clearTimeout(timer); timers.current.delete(key); void save(id, key.slice(id.length + 1) as EditableField); } }
  function select(id: string) { if (selected && selected.id !== id) { const failed = Object.entries(statuses).some(([key, status]) => key.startsWith(`${selected.id}:`) && status.state === "error"); if (failed && !confirm("저장하지 못한 항목이 있습니다. 그래도 이동할까요?")) return; flushApp(selected.id); } setSelectedId(id); }
  function add() { setError(""); startMutation(async () => { try { const row = await addApplicationRowAction(accessCode, studentId); publish([...appsRef.current, row]); setSelectedId(row.id); setTab("basic"); router.refresh(); } catch { setError("지원대학을 추가하지 못했습니다."); } }); }
  function remove() { if (!selected || !confirm(`${selected.university_name.trim() || "선택한 지원대학"} 정보를 삭제할까요?`)) return; setError(""); startMutation(async () => { try { await deleteApplicationRowAction(accessCode, selected.id); const next = appsRef.current.filter((app) => app.id !== selected.id).map((app, index) => ({ ...app, seq: index + 1 })); publish(next); setChecklist((items) => items.filter((item) => item.application_id !== selected.id)); setSelectedId(next[0]?.id ?? ""); router.refresh(); } catch { setError("지원대학을 삭제하지 못했습니다."); } }); }

  return <div className="min-w-0 space-y-4">
    <section className="grid gap-3 rounded-xl border border-line bg-white p-4 shadow-card sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><p className="text-lg font-bold text-navy">{studentName}</p><p className="mt-1 break-words text-sm text-muted">{className} · {studentNumber ? `학번 ${studentNumber}` : "학번 미입력"}</p></div><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-blue-50 px-3 py-2 text-brand">지원대학 {filledCount}개</span><span className="rounded-full bg-amber-50 px-3 py-2 text-amber-800">일정 {scheduleCount}/{apps.length * 5}</span><SaveSummary state={overall} /></div></section>
    <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-xl border border-line bg-white p-4 shadow-card" aria-label="지원대학 목록"><h2 className="font-bold text-navy">지원대학 목록</h2><div className="mt-3 grid max-h-[520px] gap-2 overflow-y-auto pr-1">{apps.map((app) => <button key={app.id} type="button" aria-pressed={selectedId === app.id} onClick={() => select(app.id)} className={`min-h-16 min-w-0 rounded-lg border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selectedId === app.id ? "border-navy bg-navy text-white" : "border-line hover:border-brand hover:bg-blue-50"}`}><span className="block break-words text-sm font-bold">{app.seq}. {app.university_name.trim() || "대학 미입력"}</span><span className={`mt-1 block break-words text-xs ${selectedId === app.id ? "text-blue-100" : "text-muted"}`}>{app.department.trim() || "학과 미입력"}{app.admission_type.trim() ? ` · ${app.admission_type}` : ""}</span></button>)}</div><button type="button" onClick={add} disabled={isMutating || apps.length >= MAX_APPLICATION_ROWS} className="mt-4 min-h-11 w-full rounded-lg border border-brand px-4 text-sm font-bold text-brand hover:bg-blue-50 disabled:opacity-50">+ 지원대학 추가</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</aside>
      <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-white shadow-card">{!selected ? <p className="p-8 text-center text-sm text-muted">지원대학을 추가해 주세요.</p> : <><header className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4 sm:p-5"><div className="min-w-0"><h2 className="break-words text-xl font-bold text-navy">{selected.university_name.trim() || "대학 미입력"}</h2><p className="mt-1 break-words text-sm text-muted">{selected.department.trim() || "학과 미입력"}</p></div><button type="button" onClick={remove} disabled={isMutating} className="min-h-11 rounded-lg border border-line px-4 text-sm font-semibold text-slate-600 hover:border-red-300 hover:text-red-700">삭제</button></header>
        <div role="tablist" aria-label="지원대학 상세 메뉴" className="flex max-w-full gap-1 overflow-x-auto border-b border-line px-2">{TABS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold ${tab === item.id ? "border-brand text-brand" : "border-transparent text-muted"}`}>{item.label}</button>)}</div>
        <div className="min-w-0 p-4 sm:p-5">{tab === "basic" && <div className="grid min-w-0 gap-5 sm:grid-cols-2"><ReadOnly label="설립 구분" value={selected.establishment_type} />{BASIC.map((config) => <Control key={config.field} app={selected} config={config} status={statuses[keyOf(selected.id, config.field)]} onChange={(value) => change(selected.id, config, value)} onBlur={() => flush(selected.id, config.field)} onRetry={() => flush(selected.id, config.field)} />)}</div>}{tab === "consultation" && <div><p className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">담임 선생님이 보완한 상담 정보입니다. 학생 화면에서는 읽기만 가능합니다.</p><div className="grid min-w-0 gap-4 sm:grid-cols-2">{READ_ONLY.map(({ field, label }) => <ReadOnly key={field} label={label} value={selected[field] as string | null} />)}</div></div>}{tab === "schedule" && <div className="grid min-w-0 gap-5 sm:grid-cols-2">{SCHEDULE.map((config) => <Control key={config.field} app={selected} config={config} status={statuses[keyOf(selected.id, config.field)]} onChange={(value) => change(selected.id, config, value)} onBlur={() => flush(selected.id, config.field)} onRetry={() => flush(selected.id, config.field)} />)}</div>}{tab === "documents" && <ChecklistPanel accessCode={accessCode} applications={apps} initialItems={checklist} onItemsChange={setChecklist} />}</div></>}</section>
    </div>
  </div>;
}

function Control({ app, config, status, onChange, onBlur, onRetry }: { app: Application; config: Config; status?: Status; onChange: (value: string) => void; onBlur: () => void; onRetry: () => void }) {
  const value = String(app[config.field] ?? ""); const id = `student-${app.id}-${config.field}`; const cls = "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  return <div className="min-w-0"><label htmlFor={id} className="text-sm font-semibold text-slate-700">{config.label}</label>{config.kind === "select" ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={cls}><option value="">선택</option>{ADMISSION_TYPES.map((option) => <option key={option}>{option}</option>)}</select> : config.kind === "textarea" ? <textarea id={id} value={value} rows={3} placeholder={config.placeholder ?? "일정과 시간을 입력해 주세요."} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className={`${cls} resize-y whitespace-pre-wrap`} /> : <input id={id} value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} className={cls} />}<FieldStatus status={status} onRetry={onRetry} /></div>;
}
function ReadOnly({ label, value }: { label: string; value: string | null | undefined }) { return <div className="min-w-0 rounded-lg border border-line bg-subtle/50 p-4"><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{value?.trim() || "아직 입력되지 않음"}</p></div>; }
function FieldStatus({ status, onRetry }: { status?: Status; onRetry: () => void }) { const label = status?.state === "dirty" ? "저장 대기" : status?.state === "saving" ? "저장 중…" : status?.state === "saved" ? "저장됨" : status?.state === "error" ? "저장 실패" : ""; return <div className="mt-1 flex min-h-9 items-center justify-between gap-2"><span role="status" aria-live="polite" className={`text-xs ${status?.state === "error" ? "text-red-700" : "text-muted"}`}>{label}</span>{status?.state === "error" && <button type="button" onClick={onRetry} className="min-h-9 rounded border border-red-300 px-2 text-xs font-semibold text-red-700">다시 시도</button>}</div>; }
function SaveSummary({ state }: { state: SaveState }) { const label = state === "dirty" ? "저장 대기" : state === "saving" ? "저장 중" : state === "error" ? "저장 실패" : "자동저장 완료"; return <span role="status" aria-live="polite" className={`rounded-full px-3 py-2 ${state === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{label}</span>; }
