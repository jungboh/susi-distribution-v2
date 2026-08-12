import { notFound } from "next/navigation";
import {
  ensureMinimumRows,
  getStudentByCode,
  listApplications,
  listChecklist,
} from "@/lib/data";
import { StudentApplicationWorkspace } from "@/components/student-application-workspace";
import { CLASS_NAME_BY_CODE } from "@/lib/class-codes";
import { logServerError, logServerEvent } from "@/lib/server-debug";
import { StudentFooter } from "@/components/student-footer";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  logServerEvent("page.apply.lookup-student");
  let student;
  try {
    student = await getStudentByCode(code);
  } catch (error) {
    logServerError("page.apply.lookup-student", error);
    throw error;
  }

  if (!student) {
    notFound();
  }

  let applications;
  let checklist;
  try {
    logServerEvent("page.apply.ensure-rows");
    await ensureMinimumRows(student.id);
    logServerEvent("page.apply.list-applications");
    [applications, checklist] = await Promise.all([
      listApplications(student.id),
      listChecklist(student.id),
    ]);
  } catch (error) {
    logServerError("page.apply.load-applications", error);
    throw error;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="w-full flex-1 px-4 py-4">
        <header className="mb-3 shrink-0">
          <p className="text-xs font-medium text-brand">
            {CLASS_NAME_BY_CODE[student.class_code]} 수시지원
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">
            {student.name} 학생 지원 대학 목록
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            입력한 내용은 자동으로 저장됩니다. 값 입력 후 다른 칸을 클릭하면
            저장돼요.
          </p>
        </header>

        <StudentApplicationWorkspace
          studentId={student.id}
          classCode={student.class_code}
          accessCode={code}
          initialApplications={applications}
          initialChecklist={checklist}
        />
      </main>

      <StudentFooter />
    </div>
  );
}
