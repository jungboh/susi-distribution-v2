"use client";

import { useEffect, useState } from "react";
import type { Application, ChecklistItem } from "@/lib/types";
import { ConsultationEditor } from "./consultation-editor";

export function ConsultationApplicationsPanel({ studentId, studentName, initialApplications, initialChecklist }: {
  studentId: string;
  studentName: string;
  initialApplications: Application[];
  initialChecklist: ChecklistItem[];
}) {
  const [applications, setApplications] = useState(initialApplications);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  return <ConsultationEditor studentId={studentId} studentName={studentName} initialApplications={applications} initialChecklist={initialChecklist} onApplicationsChange={setApplications} />;
}
