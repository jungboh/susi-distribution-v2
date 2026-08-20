import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChecklistPanel } from "@/components/checklist-panel";
import { ConsultationApplicationsPanel } from "@/components/consultation";
import { CopyLinkButton } from "@/components/copy-link-button";
import { StudentExportActions } from "@/components/student-export-actions";
import { StudentDetailTabs } from "@/components/teacher/student-detail-tabs";
import { TeacherAppShell } from "@/components/teacher/teacher-app-shell";
import { PageContainer, PageSection } from "@/components/ui/page-layout";
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
        <section className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-5 shadow-card">
          <div><h1 className="text-2xl font-bold text-navy sm:text-3xl">{student.name}</h1><p className="mt-1 text-sm text-muted">{className}{student.student_number ? ` · 학번 ${student.student_number}` : " · 학번 미등록"}</p></div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3"><span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand">지원대학 {applicationCount}개</span><span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">제출서류 {checklistDone}/{checklist.length}</span><CopyLinkButton code={student.access_code} /></div>
        </section>
        <div className="mb-3 flex justify-end"><StudentExportActions studentId={student.id} /></div>
        <StudentDetailTabs
          applicationsPanel={<ConsultationApplicationsPanel studentId={student.id} initialApplications={applications} initialChecklist={checklist} />}
          checklistPanel={<PageSection title="제출서류"><ChecklistPanel applications={applications} initialItems={checklist} /></PageSection>}
        />
      </PageContainer>
    </TeacherAppShell>
  );
}
