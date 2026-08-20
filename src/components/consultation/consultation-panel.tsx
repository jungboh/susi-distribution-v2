"use client";

import { useEffect, useState } from "react";
import type { Application, ChecklistItem } from "@/lib/types";
import { ConsultationEditor } from "./consultation-editor";

export function ConsultationApplicationsPanel({ studentId, initialApplications, initialChecklist }: {
  studentId: string;
  initialApplications: Application[];
  initialChecklist: ChecklistItem[];
}) {
  const [applications, setApplications] = useState(initialApplications);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  return <ConsultationEditor studentId={studentId} initialApplications={applications} initialChecklist={initialChecklist} onApplicationsChange={setApplications} />;
}
