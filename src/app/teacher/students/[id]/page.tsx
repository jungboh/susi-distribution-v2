import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdmissionExcelImport } from "@/components/admission-excel-import";
import { ChecklistPanel } from "@/components/checklist-panel";
import { ConsultationApplicationsPanel } from "@/components/consultation";
import { CopyLinkButton } from "@/components/copy-link-button";
import { InterestPdfImport } from "@/components/interest-pdf-import";
import { StudentExportActions } from "@/components/student-export-actions";
import { StudentDetailTabs } from "@/components/teacher/student-detail-tabs";
import { TeacherAppShell } from "@/components/teacher/teacher-app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer, PageHeader, PageSection } from "@/components/ui/page-layout";
import { CLASS_UI_NAME_BY_CODE, isClassCode } from "@/lib/class-codes";
import { getStudentById, listApplications, listChecklist } from "@/lib/data";
import { logServerError, logServerEvent } from "@/lib/server-debug";
import { requireTeacherClassSession } from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

export default async function TeacherStudentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ class?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!query.class || !isClassCode(query.class)) redirect("/");
  const classCode = query.class;
  logServerEvent("page.teacher-student.render", { classCode });
  await requireTeacherClassSession(classCode);

  let student;
  try { student = await getStudentById(id); } catch (error) { logServerError("page.teacher-student.lookup", error); throw error; }
  if (!student || student.class_code !== classCode) notFound();

  let applications;
  let checklist;
  try { [applications, checklist] = await Promise.all([listApplications(student.id), listChecklist(student.id)]); }
  catch (error) { logServerError("page.teacher-student.load-details", error); throw error; }

  const applicationCount = applications.filter((application) => application.university_name.trim()).length;
  const checklistDone = checklist.filter((item) => item.is_submitted).length;
  const className = CLASS_UI_NAME_BY_CODE[classCode];
  const backHref = `/teacher?class=${classCode}&view=students`;

  return (
    <TeacherAppShell classCode={classCode} view="students" title={`${student.name} 학생 상세`}>
      <PageContainer>
        <Link href={backHref} className="mb-3 inline-flex min-h-9 items-center rounded-lg text-sm font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">← 학생 관리로 돌아가기</Link>
        <PageHeader title={student.name} description={`${className}${student.student_number ? ` · 학번 ${student.student_number}` : " · 학번 미등록"}`} actions={<CopyLinkButton code={student.access_code} />} />
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <SummaryCard label="지원대학" value={applicationCount > 0 ? `${applicationCount}건` : "미입력"} icon="document" />
          <SummaryCard label="체크리스트" value={checklist.length > 0 ? `${checklistDone} / ${checklist.length}` : "항목 없음"} icon="checklist" />
        </div>
        <PageSection title="문서 내보내기" description="기존 Excel·PDF·인쇄 기능을 사용합니다."><StudentExportActions studentId={student.id} /></PageSection>
        {classCode === "finance" && <PageSection title="데이터 가져오기" description="기존 금융반 가져오기 기능을 유지합니다."><AdmissionExcelImport /><InterestPdfImport /></PageSection>}
        <StudentDetailTabs
          applicationsPanel={<ConsultationApplicationsPanel student={student} studentId={student.id} classCode={classCode} className={className} initialApplications={applications} />}
          checklistPanel={<PageSection title="제출서류"><ChecklistPanel applications={applications} initialItems={checklist} /></PageSection>}
        />
      </PageContainer>
    </TeacherAppShell>
  );
}

type SummaryIconName = "document" | "checklist";

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: SummaryIconName }) {
  return <Card><CardContent className="flex items-center justify-between gap-3 p-4"><div><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-1 text-xl font-bold text-navy">{value}</p></div><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-navy"><SummaryIcon name={icon} /></span></CardContent></Card>;
}

function SummaryIcon({ name }: { name: SummaryIconName }) {
  const common = { className: "size-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  const icons: Record<SummaryIconName, ReactNode> = {
    document: <svg {...common}><path d="M6 4h9l3 3v13H6Z" /><path d="M9 10h6M9 13h6M9 16h4" /></svg>,
    checklist: <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="m8 12 2.5 2.5L16 9" /></svg>,
  };
  return icons[name];
}
