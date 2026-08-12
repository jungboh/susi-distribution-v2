"use client";

import { useEffect, useState } from "react";
import { Application, ChecklistItem } from "@/lib/types";
import type { ClassCode } from "@/lib/class-codes";
import { ApplicationTable } from "@/components/application-table";
import { ChecklistPanel } from "@/components/checklist-panel";

export function StudentApplicationWorkspace({
  studentId,
  classCode,
  accessCode,
  initialApplications,
  initialChecklist,
}: {
  studentId: string;
  classCode: ClassCode;
  accessCode: string;
  initialApplications: Application[];
  initialChecklist: ChecklistItem[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [checklist, setChecklist] = useState(initialChecklist);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  useEffect(() => {
    setChecklist(initialChecklist);
  }, [initialChecklist]);

  function handleApplicationDeleted(applicationId: string) {
    setChecklist((current) =>
      current.filter((item) => item.application_id !== applicationId)
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-[60vh] min-h-[420px]">
        <ApplicationTable
          studentId={studentId}
          classCode={classCode}
          accessCode={accessCode}
          initialApplications={applications}
          fillViewport
          onApplicationsChange={setApplications}
          onApplicationDeleted={handleApplicationDeleted}
        />
      </div>

      <ChecklistPanel
        accessCode={accessCode}
        applications={applications}
        initialItems={checklist}
        onItemsChange={setChecklist}
      />
    </div>
  );
}
