import Link from "next/link";
import { AddStudentForm } from "@/components/add-student-form";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DeleteStudentButton } from "@/components/delete-student-button";
import { DataTable, DataTableShell } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer, PageHeader, PageSection } from "@/components/ui/page-layout";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { ClassCode } from "@/lib/class-codes";
import type { listStudentsWithStats } from "@/lib/data";
import { STUDENT_STATUS_LABEL, type StudentStatus } from "@/lib/types";

type Students = Awaited<ReturnType<typeof listStudentsWithStats>>;
type StatusFilter = "all" | StudentStatus;

const STATUS_TONE: Record<StudentStatus, StatusTone> = {
  done: "success",
  in_progress: "warning",
  not_started: "neutral",
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "done", label: `작성 ${STUDENT_STATUS_LABEL.done}` },
  { id: "in_progress", label: `작성 ${STUDENT_STATUS_LABEL.in_progress}` },
  { id: "not_started", label: STUDENT_STATUS_LABEL.not_started },
];

const PAGE_SIZE = 10;

function resolveStatusFilter(value?: string): StatusFilter {
  return value === "done" || value === "in_progress" || value === "not_started" ? value : "all";
}

export function StudentManagement({
  classCode,
  students,
  totalCount,
  query,
  status,
  page,
}: {
  classCode: ClassCode;
  students: Students;
  totalCount: number;
  query?: string;
  status?: string;
  page?: string;
}) {
  const hasQuery = Boolean(query?.trim());
  const activeStatus = resolveStatusFilter(status);

  const statusCounts: Record<StatusFilter, number> = { all: students.length, done: 0, in_progress: 0, not_started: 0 };
  for (const student of students) statusCounts[student.stats.status] += 1;

  const filtered = activeStatus === "all" ? students : students.filter((student) => student.stats.status === activeStatus);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const pageStudents = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startIndex = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE;

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
        description="작성 상태는 지원대학·체크리스트 입력을 기준으로 화면에서 자동 계산하며, 별도 완료 처리 절차는 없습니다."
      >
        <SearchForm classCode={classCode} query={query} status={activeStatus} />
        <StatusTabs classCode={classCode} query={query} active={activeStatus} counts={statusCounts} />
        {filtered.length === 0 ? (
          <EmptyState
            className="mt-4"
            title={hasQuery || activeStatus !== "all" ? "조건에 맞는 학생이 없습니다" : "현재 등록된 학생이 없습니다"}
            description={hasQuery || activeStatus !== "all" ? "다른 이름·학번으로 검색하거나 상태 필터를 초기화해 주세요." : "위 학생 추가 영역에서 첫 학생을 등록할 수 있습니다."}
            action={hasQuery ? <ResetSearchLink classCode={classCode} /> : undefined}
          />
        ) : (
          <>
            <DesktopStudentTable classCode={classCode} students={pageStudents} startIndex={startIndex} />
            <MobileStudentList classCode={classCode} students={pageStudents} />
            <Pagination classCode={classCode} query={query} status={activeStatus} currentPage={currentPage} totalPages={totalPages} />
          </>
        )}
      </PageSection>
    </PageContainer>
  );
}

function SearchForm({ classCode, query, status }: { classCode: ClassCode; query?: string; status: StatusFilter }) {
  return (
    <form action="/teacher" className="mb-4 flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row" role="search">
      <input type="hidden" name="class" value={classCode} />
      <input type="hidden" name="view" value="students" />
      {status !== "all" && <input type="hidden" name="status" value={status} />}
      <label htmlFor="student-search" className="sr-only">학생 이름 또는 학번 검색</label>
      <input id="student-search" name="q" defaultValue={query ?? ""} placeholder="이름 또는 학번 검색" className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      <div className="flex gap-2">
        <button type="submit" className="min-h-11 flex-1 rounded-lg border border-navy bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:flex-none">검색</button>
        {query?.trim() && <ResetSearchLink classCode={classCode} compact />}
      </div>
    </form>
  );
}

function StatusTabs({ classCode, query, active, counts }: { classCode: ClassCode; query?: string; active: StatusFilter; counts: Record<StatusFilter, number> }) {
  const queryParam = query?.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
  return (
    <div role="tablist" aria-label="작성 상태 필터" className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
      {STATUS_FILTERS.map((item) => (
        <Link
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          href={`/teacher?class=${classCode}&view=students${item.id === "all" ? "" : `&status=${item.id}`}${queryParam}`}
          className={`min-h-11 shrink-0 border-b-2 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${active === item.id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          {item.label} ({counts[item.id]})
        </Link>
      ))}
    </div>
  );
}

function DesktopStudentTable({ classCode, students, startIndex }: { classCode: ClassCode; students: Students; startIndex: number }) {
  return (
    <DataTableShell className="hidden md:block">
      <DataTable>
        <thead><tr><th scope="col">번호</th><th scope="col">학생</th><th scope="col">작성 상태</th><th scope="col">지원대학</th><th scope="col">체크리스트</th><th scope="col">최근 수정일</th><th scope="col" className="text-right">관리</th></tr></thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td className="text-muted">{startIndex + index + 1}</td>
              <td><Link href={`/teacher/students/${student.id}?class=${classCode}`} className="block rounded font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span>{student.name}</span>{student.student_number && <span className="ml-2 text-xs font-normal text-muted">{student.student_number}</span>}</Link></td>
              <td><StatusBadge tone={STATUS_TONE[student.stats.status]}>{STUDENT_STATUS_LABEL[student.stats.status]}</StatusBadge></td>
              <td>{student.stats.filledCount > 0 ? `지원대학 ${student.stats.filledCount}건` : <span className="text-muted">지원대학 미입력</span>}</td>
              <td>{student.stats.checklistTotal > 0 ? `완료 ${student.stats.checklistDone} / ${student.stats.checklistTotal}` : <span className="text-muted">체크리스트 항목 없음</span>}</td>
              <td className="text-muted">{formatLastModified(student.stats.lastModifiedAt)}</td>
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
    <ul className="grid gap-2 md:hidden" aria-label="학생 목록">
      {students.map((student) => (
        <li key={student.id} className="min-w-0 rounded-ui border border-line bg-white p-3 shadow-card">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0"><p className="truncate font-bold text-slate-900">{student.name}</p>{student.student_number && <p className="mt-0.5 text-xs text-muted">학번 {student.student_number}</p>}</div>
            <div className="flex shrink-0 items-center gap-2"><StatusBadge tone={STATUS_TONE[student.stats.status]}>{STUDENT_STATUS_LABEL[student.stats.status]}</StatusBadge><DetailLink href={`/teacher/students/${student.id}?class=${classCode}`} /></div>
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-subtle p-2 text-xs">
            <div className="min-w-0"><dt className="text-muted">지원대학</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{student.stats.filledCount > 0 ? `${student.stats.filledCount}건` : "미입력"}</dd></div>
            <div className="min-w-0"><dt className="text-muted">체크리스트</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{student.stats.checklistTotal > 0 ? `${student.stats.checklistDone} / ${student.stats.checklistTotal}` : "항목 없음"}</dd></div>
            <div className="min-w-0"><dt className="text-muted">최근 수정</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{formatLastModifiedCompact(student.stats.lastModifiedAt)}</dd></div>
          </dl>
          <div className="mt-2 flex flex-wrap justify-end gap-2 border-t border-line pt-2"><CopyLinkButton code={student.access_code} /><DeleteStudentButton studentId={student.id} name={student.name} /></div>
        </li>
      ))}
    </ul>
  );
}

function Pagination({ classCode, query, status, currentPage, totalPages }: { classCode: ClassCode; query?: string; status: StatusFilter; currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const buildHref = (targetPage: number) => {
    const queryParam = query?.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
    const statusParam = status === "all" ? "" : `&status=${status}`;
    return `/teacher?class=${classCode}&view=students${statusParam}${queryParam}&page=${targetPage}`;
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav aria-label="학생 목록 페이지" className="mt-4 flex flex-wrap items-center justify-center gap-1">
      <PageLink href={buildHref(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</PageLink>
      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildHref(pageNumber)}
          aria-current={pageNumber === currentPage ? "page" : undefined}
          className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${pageNumber === currentPage ? "border-navy bg-navy text-white" : "border-line bg-white text-slate-700 hover:bg-subtle"}`}
        >
          {pageNumber}
        </Link>
      ))}
      <PageLink href={buildHref(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>›</PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: string }) {
  if (disabled) return <span aria-hidden="true" className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-line text-sm text-slate-300">{children}</span>;
  return <Link href={href} className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-white text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{children}</Link>;
}

function formatLastModified(iso: string | null) {
  if (!iso) return "-";
  return iso.slice(0, 16).replace("T", " ");
}

function formatLastModifiedCompact(iso: string | null) {
  if (!iso) return "-";
  return iso.slice(5, 16).replace("T", " ");
}

function DetailLink({ href }: { href: string }) {
  return <Link href={href} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">상세 보기</Link>;
}

function ResetSearchLink({ classCode, compact = false }: { classCode: ClassCode; compact?: boolean }) {
  return <Link href={`/teacher?class=${classCode}&view=students`} className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${compact ? "flex-1 sm:flex-none" : ""}`}>검색 초기화</Link>;
}
