import { redirect } from "next/navigation";
import { AppFooter } from "@/components/app-footer";
import { TeacherAuthPanel } from "@/components/teacher-auth-panel";
import { LinkManagement } from "@/components/teacher/link-management";
import { StudentManagement } from "@/components/teacher/student-management";
import { TeacherAppShell } from "@/components/teacher/teacher-app-shell";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-layout";
import { CLASS_UI_NAME_BY_CODE, isClassCode, type ClassCode } from "@/lib/class-codes";
import { listStudents, listStudentsWithStats } from "@/lib/data";
import { logServerError, logServerEvent } from "@/lib/server-debug";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

type TeacherView = "dashboard" | "students" | "links";

function resolveView(value?: string): TeacherView {
  if (value === "students" || value === "links") return value;
  return "dashboard";
}

export default async function TeacherPage({ searchParams }: { searchParams: Promise<{ class?: string; q?: string; view?: string }> }) {
  const params = await searchParams;
  const rawClassCode = params.class;
  if (!rawClassCode || !isClassCode(rawClassCode)) redirect("/");
  const classCode: ClassCode = rawClassCode;
  const view = resolveView(params.view);

  logServerEvent("page.teacher.render", { classCode, view });
  let session = null;
  try {
    session = await readVerifiedTeacherClassSession();
  } catch (error) {
    logServerError("page.teacher.verify-session", error);
  }
  if (!session || session.classCode !== classCode) {
    return <div className="flex min-h-screen flex-col bg-page"><main className="relative flex flex-1 items-center py-10 sm:py-16"><div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--color-brand)/0.12),transparent_62%)]" /><PageContainer className="relative flex justify-center"><TeacherAuthPanel classCode={classCode} /></PageContainer></main><AppFooter /></div>;
  }

  const titleByView = { dashboard: "대시보드", students: "학생 관리", links: "링크 관리" } as const;
  const title = `${CLASS_UI_NAME_BY_CODE[classCode]} ${titleByView[view]}`;

  try {
    if (view === "links") {
      const [students, allStudents] = await Promise.all([
        listStudents(classCode, params.q),
        params.q?.trim() ? listStudents(classCode) : Promise.resolve(null),
      ]);
      return <TeacherAppShell classCode={classCode} view={view} title={title}><LinkManagement classCode={classCode} students={students} totalCount={allStudents?.length ?? students.length} query={params.q} /></TeacherAppShell>;
    }

    if (view === "students" && params.q?.trim()) {
      const [students, allStudents] = await Promise.all([listStudentsWithStats(classCode, params.q), listStudentsWithStats(classCode)]);
      return <TeacherAppShell classCode={classCode} view={view} title={title}><StudentManagement classCode={classCode} students={students} totalCount={allStudents.length} query={params.q} /></TeacherAppShell>;
    }

    const students = await listStudentsWithStats(classCode);
    return <TeacherAppShell classCode={classCode} view={view} title={title}>{view === "dashboard" ? <TeacherDashboard classCode={classCode} students={students} /> : <StudentManagement classCode={classCode} students={students} totalCount={students.length} query={params.q} />}</TeacherAppShell>;
  } catch (error) {
    logServerError("page.teacher.list-students", error);
    return <TeacherAppShell classCode={classCode} view={view} title={title}><PageContainer><EmptyState title="학생 정보를 불러오지 못했습니다." description="잠시 후 다시 시도해 주세요." /></PageContainer></TeacherAppShell>;
  }
}
