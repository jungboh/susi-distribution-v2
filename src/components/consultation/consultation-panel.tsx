"use client";

import { useEffect, useState } from "react";
import type { Application } from "@/lib/types";
import { ConsultationEditor } from "./consultation-editor";

export function ConsultationApplicationsPanel({ studentId, initialApplications }: {
  studentId: string;
  initialApplications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  return <ConsultationEditor studentId={studentId} initialApplications={applications} onApplicationsChange={setApplications} />;
}
