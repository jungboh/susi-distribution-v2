"use client";

import { useState, type ReactNode } from "react";

type DetailTab = "applications" | "checklist";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "applications", label: "지원 대학 현황" },
  { id: "checklist", label: "제출서류" },
];

export function StudentDetailTabs({ applicationsPanel, checklistPanel }: { applicationsPanel: ReactNode; checklistPanel: ReactNode }) {
  const [tab, setTab] = useState<DetailTab>("applications");

  return (
    <div className="mt-2">
      <div role="tablist" aria-label="학생 상세 메뉴" className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`student-detail-panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${tab === item.id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {/* hidden으로만 전환 — 언마운트하면 상담 필드 자동저장 진행 상태가 끊긴다 */}
      <div id="student-detail-panel-applications" role="tabpanel" hidden={tab !== "applications"} className="pt-5">
        {applicationsPanel}
      </div>
      <div id="student-detail-panel-checklist" role="tabpanel" hidden={tab !== "checklist"} className="pt-5">
        {checklistPanel}
      </div>
    </div>
  );
}
