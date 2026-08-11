import { notFound } from "next/navigation";
import {
  getStudentById,
  listApplications,
  listChecklist,
} from "@/lib/data";
import { TeacherHeader } from "@/app/teacher/teacher-header";
import { ApplicationTable } from "@/components/application-table";
import { ChecklistPanel } from "@/components/checklist-panel";
import { CopyLinkButton } from "@/components/copy-link-button";
import { StudentExportActions } from "@/components/student-export-actions";
import { AppFooter } from "@/components/app-footer";
import { CLASS_NAME_BY_CODE } from "@/lib/class-codes";
import { requireTeacherClassSession } from "@/lib/teacher-auth";
import { logServerError, logServerEvent } from "@/lib/server-debug";

export const dynamic = "force-dynamic";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  logServerEvent("page.teacher-student.render");
  const { id } = await params;
  let student;
  try {
    logServerEvent("page.teacher-student.lookup");
    student = await getStudentById(id);
  } catch (error) {
    logServerError("page.teacher-student.lookup", error);
    throw error;
  }

  if (!student) {
    notFound();
  }

  await requireTeacherClassSession(student.class_code);
  const backHref = `/teacher?class=${student.class_code}`;

  let applications;
  let checklist;
  try {
    logServerEvent("page.teacher-student.load-details");
    [applications, checklist] = await Promise.all([
      listApplications(student.id),
      listChecklist(student.id),
    ]);
  } catch (error) {
    logServerError("page.teacher-student.load-details", error);
    throw error;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="w-full flex-1 px-4 py-8">
        <TeacherHeader
        title={`${student.name} 학생${
          student.student_number ? ` (${student.student_number})` : ""
        }`}
        backHref={backHref}
        backLabel={`${CLASS_NAME_BY_CODE[student.class_code]} 학생 목록`}
        showClassLock={false}
      />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {CLASS_NAME_BY_CODE[student.class_code]}
        </p>
        <CopyLinkButton code={student.access_code} />
        </div>

        <StudentExportActions studentId={student.id} />

        <div className="mb-6">
          <ApplicationTable
            studentId={student.id}
            initialApplications={applications}
          />
        </div>

        <ChecklistPanel
          applications={applications}
          initialItems={checklist}
        />
      </main>
      <AppFooter />
    </div>
  );
}
