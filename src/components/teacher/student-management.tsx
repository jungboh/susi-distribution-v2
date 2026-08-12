import Link from "next/link";
import { AddStudentForm } from "@/components/add-student-form";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DeleteStudentButton } from "@/components/delete-student-button";
import { DataTable, DataTableShell } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer, PageHeader, PageSection } from "@/components/ui/page-layout";
import type { ClassCode } from "@/lib/class-codes";
import type { listStudentsWithStats } from "@/lib/data";

type Students = Awaited<ReturnType<typeof listStudentsWithStats>>;

export function StudentManagement({
  classCode,
  students,
  totalCount,
  query,
}: {
  classCode: ClassCode;
  students: Students;
  totalCount: number;
  query?: string;
}) {
  const hasQuery = Boolean(query?.trim());

  return (
    <PageContainer>
      <PageHeader
        title="학생 관리"
        description="현재 학급의 학생과 수시 지원자료 입력 현황을 관리합니다."
        actions={
          <div className="text-right text-sm text-muted">
            <p>전체 학생 <strong className="text-slate-900">{totalCount}명</strong></p>
            {hasQuery && <p className="mt-0.5">검색 결과 {students.length}명</p>}
          </div>
        }
      />

      <PageSection title="학생 추가" description="추가한 학생은 현재 인증된 학급에만 등록됩니다.">
        <AddStudentForm classCode={classCode} />
      </PageSection>

      <PageSection
        title="학생 목록"
        description="지원대학과 체크리스트는 실제 입력된 항목만 집계합니다."
      >
        <SearchForm classCode={classCode} query={query} />
        {students.length === 0 ? (
          <EmptyState
            className="mt-4"
            title={hasQuery ? "검색 결과가 없습니다" : "현재 등록된 학생이 없습니다"}
            description={hasQuery ? "다른 이름이나 학번으로 검색하거나 검색을 초기화해 주세요." : "위 학생 추가 영역에서 첫 학생을 등록할 수 있습니다."}
            action={hasQuery ? <ResetSearchLink classCode={classCode} /> : undefined}
          />
        ) : (
          <>
            <DesktopStudentTable classCode={classCode} students={students} />
            <MobileStudentList classCode={classCode} students={students} />
          </>
        )}
      </PageSection>
    </PageContainer>
  );
}

function SearchForm({ classCode, query }: { classCode: ClassCode; query?: string }) {
  return (
    <form action="/teacher" className="mb-4 flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row" role="search">
      <input type="hidden" name="class" value={classCode} />
      <input type="hidden" name="view" value="students" />
      <label htmlFor="student-search" className="sr-only">학생 이름 또는 학번 검색</label>
      <input id="student-search" name="q" defaultValue={query ?? ""} placeholder="이름 또는 학번 검색" className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      <div className="flex gap-2">
        <button type="submit" className="min-h-11 flex-1 rounded-lg border border-navy bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:flex-none">검색</button>
        {query?.trim() && <ResetSearchLink classCode={classCode} compact />}
      </div>
    </form>
  );
}

function DesktopStudentTable({ classCode, students }: { classCode: ClassCode; students: Students }) {
  return (
    <DataTableShell className="hidden md:block">
      <DataTable>
        <thead><tr><th scope="col">학생</th><th scope="col">지원대학</th><th scope="col">체크리스트</th><th scope="col" className="text-right">관리</th></tr></thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td><Link href={`/teacher/students/${student.id}?class=${classCode}`} className="block rounded font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span>{student.name}</span>{student.student_number && <span className="ml-2 text-xs font-normal text-muted">{student.student_number}</span>}</Link></td>
              <td>{student.stats.filledCount > 0 ? `지원대학 ${student.stats.filledCount}건` : <span className="text-muted">지원대학 미입력</span>}</td>
              <td>{student.stats.checklistTotal > 0 ? `완료 ${student.stats.checklistDone} / ${student.stats.checklistTotal}` : <span className="text-muted">체크리스트 항목 없음</span>}</td>
              <td><div className="flex justify-end gap-2"><DetailLink href={`/teacher/students/${student.id}?class=${classCode}`} /><CopyLinkButton code={student.access_code} /><DeleteStudentButton studentId={student.id} name={student.name} /></div></td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </DataTableShell>
  );
}

function MobileStudentList({ classCode, students }: { classCode: ClassCode; students: Students }) {
  return (
    <ul className="grid gap-3 md:hidden" aria-label="학생 목록">
      {students.map((student) => (
        <li key={student.id} className="min-w-0 rounded-ui border border-line bg-white p-4 shadow-card">
          <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-slate-900">{student.name}</p>{student.student_number && <p className="mt-0.5 text-xs text-muted">학번 {student.student_number}</p>}</div><DetailLink href={`/teacher/students/${student.id}?class=${classCode}`} /></div>
          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-subtle p-3 text-xs"><div><dt className="text-muted">지원대학</dt><dd className="mt-1 font-semibold text-slate-800">{student.stats.filledCount > 0 ? `${student.stats.filledCount}건` : "미입력"}</dd></div><div><dt className="text-muted">체크리스트</dt><dd className="mt-1 font-semibold text-slate-800">{student.stats.checklistTotal > 0 ? `${student.stats.checklistDone} / ${student.stats.checklistTotal}` : "항목 없음"}</dd></div></dl>
          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-line pt-3"><CopyLinkButton code={student.access_code} /><DeleteStudentButton studentId={student.id} name={student.name} /></div>
        </li>
      ))}
    </ul>
  );
}

function DetailLink({ href }: { href: string }) {
  return <Link href={href} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">상세 보기</Link>;
}

function ResetSearchLink({ classCode, compact = false }: { classCode: ClassCode; compact?: boolean }) {
  return <Link href={`/teacher?class=${classCode}&view=students`} className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${compact ? "flex-1 sm:flex-none" : ""}`}>검색 초기화</Link>;
}
