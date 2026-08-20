"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Application, ChecklistItem } from "@/lib/types";
import {
  addChecklistItemAction,
  deleteChecklistItemAction,
  toggleChecklistItemAction,
  updateChecklistNoteAction,
} from "@/app/actions";

const OTHER_GROUP_KEY = "__other__";

export function ChecklistPanel({
  accessCode,
  applications,
  initialItems,
  onItemsChange,
  selectedApplicationId,
}: {
  accessCode?: string;
  applications: Application[];
  initialItems: ChecklistItem[];
  onItemsChange?: (items: ChecklistItem[]) => void;
  selectedApplicationId?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const itemsRef = useRef(initialItems);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allUniversities = useMemo(
    () =>
      applications
        .filter((a) => a.university_name.trim())
        .sort((a, b) => a.seq - b.seq),
    [applications]
  );

  const universities = useMemo(
    () => selectedApplicationId
      ? allUniversities.filter((application) => application.id === selectedApplicationId)
      : allUniversities,
    [allUniversities, selectedApplicationId]
  );

  const [selectedAppId, setSelectedAppId] = useState(
    universities[0]?.id ?? ""
  );
  const activeApplicationId = selectedApplicationId ?? selectedAppId;

  useEffect(() => {
    itemsRef.current = initialItems;
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (selectedApplicationId) {
      setSelectedAppId(selectedApplicationId);
      return;
    }
    if (!universities.some((application) => application.id === selectedAppId)) {
      setSelectedAppId(universities[0]?.id ?? "");
    }
  }, [selectedAppId, selectedApplicationId, universities]);

  function commitItems(next: ChecklistItem[]) {
    itemsRef.current = next;
    setItems(next);
    onItemsChange?.(next);
  }

  const universityIds = useMemo(
    () => new Set(universities.map((u) => u.id)),
    [universities]
  );

  const groups = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const item of items) {
      if (selectedApplicationId && item.application_id !== selectedApplicationId) {
        continue;
      }
      const key =
        item.application_id && universityIds.has(item.application_id)
          ? item.application_id
          : OTHER_GROUP_KEY;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items, selectedApplicationId, universityIds]);

  function handleAdd() {
    const trimmed = label.trim();
    if (!trimmed || !activeApplicationId) return;
    setError(null);
    startTransition(async () => {
      try {
        const item = await addChecklistItemAction(
          accessCode ?? null,
          activeApplicationId,
          trimmed
        );
        commitItems([...itemsRef.current, item]);
        setLabel("");
        router.refresh();
      } catch {
        setError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  function handleToggle(id: string, checked: boolean) {
    setError(null);
    const previous = itemsRef.current;
    commitItems(
      previous.map((i) => (i.id === id ? { ...i, is_submitted: checked } : i))
    );
    startTransition(async () => {
      try {
        const updated = await toggleChecklistItemAction(
          accessCode ?? null,
          id,
          checked
        );
        commitItems(
          itemsRef.current.map((item) => (item.id === id ? updated : item))
        );
        router.refresh();
      } catch {
        commitItems(previous);
        setError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  function handleNoteChange(id: string, note: string) {
    commitItems(
      itemsRef.current.map((i) => (i.id === id ? { ...i, note } : i))
    );
  }

  function handleNoteCommit(id: string, note: string) {
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateChecklistNoteAction(
          accessCode ?? null,
          id,
          note
        );
        commitItems(
          itemsRef.current.map((item) => (item.id === id ? updated : item))
        );
      } catch {
        setError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("이 서류 항목을 삭제할까요?")) return;
    setError(null);
    const previous = itemsRef.current;
    commitItems(previous.filter((i) => i.id !== id));
    startTransition(async () => {
      try {
        await deleteChecklistItemAction(accessCode ?? null, id);
        router.refresh();
      } catch {
        commitItems(previous);
        setError("저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  const visibleItems = selectedApplicationId
    ? items.filter((item) => item.application_id === selectedApplicationId)
    : items;
  const doneCount = visibleItems.filter((item) => item.is_submitted).length;
  const otherItems = selectedApplicationId ? [] : groups.get(OTHER_GROUP_KEY) ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          학교별 제출서류 체크리스트
        </h2>
        <span className="text-xs text-slate-400">
          {doneCount}/{visibleItems.length} 완료
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-xs text-red-500">
          {error}
        </p>
      )}

      {universities.length === 0 && (
        <p className="mb-3 rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
          학생이 아직 지원 대학을 입력하지 않았습니다. 대학을 입력하면 학교별로
          서류를 등록할 수 있습니다.
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {!selectedApplicationId && <select
          value={selectedAppId}
          onChange={(e) => setSelectedAppId(e.target.value)}
          disabled={universities.length === 0}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-brand disabled:bg-slate-50"
        >
          {universities.length === 0 && <option value="">학교 없음</option>}
          {universities.map((app) => (
            <option key={app.id} value={app.id}>
              {app.seq}. {app.university_name}
            </option>
          ))}
        </select>}
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="예: 학교생활기록부, 자기소개서, 추천서"
          disabled={universities.length === 0}
          className="min-w-[160px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-brand disabled:bg-slate-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !label.trim() || !activeApplicationId}
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          추가
        </button>
        <span role="status" aria-live="polite" className="self-center text-xs text-slate-500">
          {isPending ? "저장 중…" : ""}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {universities.map((app) => (
          <ChecklistGroup
            key={app.id}
            title={`${app.seq}. ${app.university_name}`}
            items={groups.get(app.id) ?? []}
            onToggle={handleToggle}
            onNoteChange={handleNoteChange}
            onNoteCommit={handleNoteCommit}
            onDelete={handleDelete}
          />
        ))}

        {otherItems.length > 0 && (
          <ChecklistGroup
            title="기타 (학교 미지정)"
            items={otherItems}
            onToggle={handleToggle}
            onNoteChange={handleNoteChange}
            onNoteCommit={handleNoteCommit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

function ChecklistGroup({
  title,
  items,
  onToggle,
  onNoteChange,
  onNoteCommit,
  onDelete,
}: {
  title: string;
  items: ChecklistItem[];
  onToggle: (id: string, checked: boolean) => void;
  onNoteChange: (id: string, note: string) => void;
  onNoteCommit: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const doneCount = items.filter((i) => i.is_submitted).length;

  return (
    <div className="w-60 shrink-0 rounded-lg border border-slate-100 bg-slate-50/40 p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <h3 className="truncate text-xs font-semibold text-slate-600" title={title}>
          {title}
        </h3>
        <span className="shrink-0 text-[11px] text-slate-400">
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-slate-100 bg-white p-2"
          >
            <div className="flex items-center justify-between gap-1">
              <label className="flex min-w-0 items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={item.is_submitted}
                  onChange={(e) => onToggle(item.id, e.target.checked)}
                  className="h-4 w-4 shrink-0 accent-brand"
                />
                <span
                  className={`truncate text-sm ${
                    item.is_submitted
                      ? "text-slate-400 line-through"
                      : "text-slate-700"
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="shrink-0 text-slate-300 hover:text-red-500"
                aria-label={`${item.label} 삭제`}
              >
                ×
              </button>
            </div>
            <input
              type="text"
              defaultValue={item.note}
              placeholder="메모 (선택)"
              onChange={(e) => onNoteChange(item.id, e.target.value)}
              onBlur={(e) => onNoteCommit(item.id, e.target.value)}
              className="mt-1 w-full rounded border-none bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-blue-50"
            />
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-200 p-2.5 text-center text-xs text-slate-400">
            등록된 서류가 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}
