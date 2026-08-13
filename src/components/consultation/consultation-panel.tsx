"use client";

import { useEffect, useState } from "react";
import { ApplicationTable } from "@/components/application-table";
import { PageSection } from "@/components/ui/page-layout";
import type { ClassCode } from "@/lib/class-codes";
import type { Application, Student } from "@/lib/types";
import { ConsultationEditor } from "./consultation-editor";

export function ConsultationApplicationsPanel({ student, studentId, classCode, className, initialApplications }: {
  student: Pick<Student, "name" | "student_number">;
  studentId: string;
  classCode: ClassCode;
  className: string;
  initialApplications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  return <>
    <PageSection title="수시상담 정보" description="지원대학별 37개 상담 정보를 단계별로 입력하고 필드별 저장 상태를 확인합니다.">
      <ConsultationEditor student={student} className={className} initialApplications={applications} onApplicationsChange={setApplications} />
    </PageSection>
    <PageSection title="지원대학 관리" description="입력값은 기존 자동 저장 방식으로 반영됩니다.">
      <ApplicationTable studentId={studentId} classCode={classCode} initialApplications={applications} onApplicationsChange={setApplications} />
    </PageSection>
  </>;
}
