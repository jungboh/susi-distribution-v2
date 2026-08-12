import Link from "next/link";
import { LinkBulkActions } from "@/components/teacher/link-bulk-actions";
import { StudentLinkActions } from "@/components/teacher/student-link-actions";
import { PageContainer } from "@/components/ui/page-layout";
import { CLASS_UI_NAME_BY_CODE, type ClassCode } from "@/lib/class-codes";
import type { Student } from "@/lib/types";

export function LinkManagement({ classCode, students, totalCount, query }: { classCode: ClassCode; students: Student[]; totalCount: number; query?: string }) {
  const className = CLASS_UI_NAME_BY_CODE[classCode];
  return (
    <PageContainer className="py-6 sm:py-8">
      <section aria-labelledby="link-management-heading" className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 id="link-management-heading" className="text-xl font-bold text-navy">학생 링크 관리</h2><p className="mt-1 text-sm text-muted">{className} 학생의 개인 접속 링크를 안전하게 배포합니다.</p></div>
          <LinkBulkActions classCode={classCode} className={className} />
        </div>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" role="search">
          <input type="hidden" name="class" value={classCode} /><input type="hidden" name="view" value="links" />
          <label className="sr-only" htmlFor="link-student-search">학생 이름 또는 학번 검색</label>
          <input id="link-student-search" name="q" defaultValue={query} placeholder="이름 또는 학번 검색" className="min-h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-sm" />
          <button type="submit" className="min-h-10 rounded-lg bg-navy px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">검색</button>
          {query && <Link href={`/teacher?class=${classCode}&view=links`} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line px-4 text-sm font-semibold text-slate-700">초기화</Link>}
        </form>
        <p className="mt-4 text-sm text-slate-600">검색 결과 {students.length}명 / 전체 {totalCount}명</p>
        {students.length === 0 ? <div className="mt-5 rounded-xl bg-subtle px-4 py-10 text-center text-sm text-muted">조건에 맞는 학생이 없습니다.</div> : <>
          <div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[700px] border-separate border-spacing-0 text-left text-sm"><thead><tr className="bg-subtle text-slate-700"><th className="px-3 py-3 font-semibold">학번</th><th className="px-3 py-3 font-semibold">이름</th><th className="px-3 py-3 font-semibold">링크 상태</th><th className="px-3 py-3 text-right font-semibold">관리</th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b border-line"><td className="border-b border-line px-3 py-3">{student.student_number || "-"}</td><td className="border-b border-line px-3 py-3 font-semibold text-navy">{student.name}</td><td className="border-b border-line px-3 py-3"><Status available={Boolean(student.access_code)} /></td><td className="border-b border-line px-3 py-3"><StudentLinkActions student={student} classCode={classCode} /></td></tr>)}</tbody></table></div>
          <div className="mt-4 grid gap-3 md:hidden">{students.map((student) => <article key={student.id} className="rounded-xl border border-line p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-navy">{student.name}</p><p className="mt-1 text-xs text-muted">학번 {student.student_number || "-"}</p></div><Status available={Boolean(student.access_code)} /></div><div className="mt-4"><StudentLinkActions student={student} classCode={classCode} /></div></article>)}</div>
        </>}
      </section>
    </PageContainer>
  );
}

function Status({ available }: { available: boolean }) { return <span className={available ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" : "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"}>{available ? "사용 가능" : "코드 없음"}</span>; }
