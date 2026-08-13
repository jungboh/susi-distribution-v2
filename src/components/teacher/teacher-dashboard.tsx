import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer, PageHeader, PageSection } from "@/components/ui/page-layout";
import type { ClassCode } from "@/lib/class-codes";

type DashboardStudent = {
  stats: { filledCount: number; checklistTotal: number; checklistDone: number };
};

export function TeacherDashboard({ classCode, students }: { classCode: ClassCode; students: DashboardStudent[] }) {
  const totalStudents = students.length;
  const participatingStudents = students.filter((student) => student.stats.filledCount > 0).length;
  const applicationCount = students.reduce((sum, student) => sum + student.stats.filledCount, 0);
  const checklistDone = students.reduce((sum, student) => sum + student.stats.checklistDone, 0);
  const checklistTotal = students.reduce((sum, student) => sum + student.stats.checklistTotal, 0);
  const participationRate = totalStudents === 0 ? 0 : Math.round((participatingStudents / totalStudents) * 100);
  const checklistRate = checklistTotal === 0 ? 0 : Math.round((checklistDone / checklistTotal) * 100);

  return (
    <PageContainer>
      <PageHeader
        title="대시보드"
        description="현재 학급의 실제 입력 데이터를 기준으로 현황을 확인합니다."
        actions={<LinkButton href={`/teacher?class=${classCode}&view=students`}>학생 관리</LinkButton>}
      />
      <PageSection>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="전체 학생" value={`${totalStudents}명`} description="현재 인증 학급" icon="students" />
          <MetricCard label="지원대학 입력 학생" value={`${participatingStudents}명`} description="대학명이 1개 이상 입력된 학생" icon="check" />
          <MetricCard label="지원대학" value={`${applicationCount}건`} description="대학명이 입력된 지원 건수" icon="document" />
          <MetricCard label="체크리스트 완료" value={`${checklistRate}%`} description={`${checklistDone} / ${checklistTotal}개 항목`} icon="checklist" />
        </div>
      </PageSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
        <PageSection title="지원대학 입력 현황" description="작성 완료율이 아닌 지원대학 입력 참여 비율입니다.">
          <Card>
            <CardContent className="p-6">
              {totalStudents === 0 ? (
                <EmptyState title="현재 등록된 학생이 없습니다" description="학생 관리에서 학생을 등록하면 현황이 표시됩니다." />
              ) : (
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div><strong className="text-3xl text-navy">{participationRate}%</strong><p className="mt-1 text-sm text-muted">{participatingStudents} / {totalStudents}명</p></div>
                    <LinkButton href={`/teacher?class=${classCode}&view=students`}>목록 보기</LinkButton>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="지원대학 입력 학생 비율" aria-valuemin={0} aria-valuemax={100} aria-valuenow={participationRate}>
                    <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${participationRate}%` }} />
                  </div>
                  {applicationCount === 0 && <p className="mt-4 text-sm text-muted">아직 입력된 지원대학이 없습니다.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </PageSection>

        <PageSection title="공지사항">
          <EmptyState title="공지사항 기능은 준비 중입니다" description="별도 데이터나 임시 공지는 표시하지 않습니다." />
        </PageSection>
      </div>
    </PageContainer>
  );
}

type MetricIconName = "students" | "check" | "document" | "checklist";

function MetricCard({ label, value, description, icon }: { label: string; value: string; description: string; icon: MetricIconName }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-navy"><MetricIcon name={icon} /></span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-navy">{value}</p>
        <p className="mt-2 text-xs leading-5 text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

function MetricIcon({ name }: { name: MetricIconName }) {
  const common = { className: "size-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  const icons: Record<MetricIconName, ReactNode> = {
    students: <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5 19c.7-4 3.2-6 7-6s6.3 2 7 6" /></svg>,
    check: <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>,
    document: <svg {...common}><path d="M6 4h9l3 3v13H6Z" /><path d="M9 10h6M9 13h6M9 16h4" /></svg>,
    checklist: <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="m8 12 2.5 2.5L16 9" /></svg>,
  };
  return icons[name];
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-navy bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">{children}</Link>;
}
