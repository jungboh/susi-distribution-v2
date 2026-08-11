import Link from "next/link";
import { redirect } from "next/navigation";
import {
  listClassStudentCounts,
  listStudentsWithStats,
} from "@/lib/data";
import { TeacherHeader } from "@/app/teacher/teacher-header";
import { AddStudentForm } from "@/components/add-student-form";
import { AppFooter } from "@/components/app-footer";
import { ClassSelector } from "@/components/class-selector";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DeleteStudentButton } from "@/components/delete-student-button";
import { MIN_APPLICATION_ROWS } from "@/lib/types";
import { APP_TITLE } from "@/lib/class-config";
import {
  CLASS_NAME_BY_CODE,
  isClassCode,
  type ClassCode,
} from "@/lib/class-codes";
import { requireTeacherClassSession } from "@/lib/teacher-auth";
import { logServerError, logServerEvent } from "@/lib/server-debug";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; q?: string; auth?: string }>;
}) {
  const params = await searchParams;
  const rawClassCode = params.class;
  let selectedClassCode: ClassCode | null = null;

  if (rawClassCode) {
    if (!isClassCode(rawClassCode)) {
      redirect("/teacher");
    }
    selectedClassCode = rawClassCode;
  }

  const q = params.q;

  logServerEvent("page.teacher-dashboard.render");

  if (!selectedClassCode) {
    try {
      logServerEvent("page.teacher-dashboard.class-counts");
      const counts = await listClassStudentCounts();
      return (
        <div className="flex min-h-screen flex-col">
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
            <h1 className="text-2xl font-bold text-slate-800">{APP_TITLE}</h1>
            <p className="mt-2 text-sm text-slate-500">
              관리할 학급을 선택하고 담임 비밀번호를 입력해 주세요.
            </p>
            <h2 className="mb-4 mt-8 text-lg font-bold text-slate-700">
              학급 선택
            </h2>
            {params.auth === "required" && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                해당 학급의 담임 인증이 필요합니다.
              </p>
            )}
            <ClassSelector counts={counts} />
          </main>
          <AppFooter />
        </div>
      );
    } catch (error) {
      logServerError("page.teacher-dashboard.class-counts", error);
      return <TeacherDataError />;
    }
  }

  await requireTeacherClassSession(selectedClassCode);

  let students;
  try {
    logServerEvent("page.teacher-dashboard.list-students", {
      classCode: selectedClassCode,
    });
    students = await listStudentsWithStats(selectedClassCode, q);
  } catch (error) {
    logServerError("page.teacher-dashboard.list-students", error);
    return <TeacherDataError />;
  }

  const className = CLASS_NAME_BY_CODE[selectedClassCode];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <TeacherHeader title={`${className} 학생 관리`} />

        <p className="mb-5 mt-2 text-sm text-slate-500">
          등록 학생 {students.length}명
        </p>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <form className="flex gap-2" action="/teacher">
          <input type="hidden" name="class" value={selectedClassCode} />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="이름 또는 학번 검색"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-brand hover:text-brand"
          >
            검색
          </button>
          </form>
        </div>

        <div className="mb-4">
          <AddStudentForm classCode={selectedClassCode} />
        </div>

        <p className="mb-2 text-xs text-slate-400">
          총 {students.length}명 · 대학 작성은 학생당 최소 {MIN_APPLICATION_ROWS}개
          권장
        </p>

        <ul className="flex flex-col gap-2">
        {students.map((student) => (
          <li
            key={student.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"
          >
            <Link
              href={`/teacher/students/${student.id}?class=${selectedClassCode}`}
              className="flex flex-1 flex-col gap-0.5"
            >
              <span className="text-sm font-semibold text-slate-800">
                {student.name}
                {student.student_number && (
                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    {student.student_number}
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-500">
                지원 대학 {student.stats.filledCount}개 · 서류{" "}
                {student.stats.checklistDone}/{student.stats.checklistTotal}
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              <CopyLinkButton code={student.access_code} />
              <DeleteStudentButton studentId={student.id} name={student.name} />
            </div>
          </li>
        ))}
        {students.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              {q ? "검색 결과가 없습니다." : "아직 등록된 학생이 없습니다."}
            </p>
            {!q && (
              <p className="mt-1 text-xs text-slate-400">
                다음 단계에서 학생을 등록할 수 있습니다.
              </p>
            )}
          </li>
        )}
        </ul>
      </main>
      <AppFooter />
    </div>
  );
}

function TeacherDataError() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <TeacherHeader title="학생 관리" />
        <section className="rounded-xl border border-red-100 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          학생 목록을 불러오지 못했습니다.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          잠시 후 다시 시도해 주세요.
        </p>
        <Link
          href="/teacher"
          className="mt-4 inline-block text-sm font-medium text-brand"
        >
          학급 선택으로 돌아가기
        </Link>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
