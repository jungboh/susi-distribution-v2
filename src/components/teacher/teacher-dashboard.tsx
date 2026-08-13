import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer, PageHeader, PageSection } from "@/components/ui/page-layout";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { ClassCode } from "@/lib/class-codes";
import { STUDENT_STATUS_LABEL, type StudentStatus } from "@/lib/types";

type DashboardStudent = {
  id: string;
  name: string;
  student_number: string | null;
  stats: { filledCount: number; checklistTotal: number; checklistDone: number; status: StudentStatus; lastModifiedAt: string | null };
};

const STATUS_TONE: Record<StudentStatus, StatusTone> = {
  done: "success",
  in_progress: "warning",
  not_started: "neutral",
};

const RECENT_STUDENT_LIMIT = 5;

export function TeacherDashboard({ classCode, students }: { classCode: ClassCode; students: DashboardStudent[] }) {
  const totalStudents = students.length;
  const doneCount = students.filter((student) => student.stats.status === "done").length;
  const inProgressCount = students.filter((student) => student.stats.status === "in_progress").length;
  const notStartedCount = students.filter((student) => student.stats.status === "not_started").length;
  const completionRate = totalStudents === 0 ? 0 : Math.round((doneCount / totalStudents) * 100);

  const recentStudents = [...students]
    .filter((student) => student.stats.lastModifiedAt)
    .sort((a, b) => (b.stats.lastModifiedAt! > a.stats.lastModifiedAt! ? 1 : -1))
    .slice(0, RECENT_STUDENT_LIMIT);

  return (
    <PageContainer>
      <PageHeader
        title="대시보드"
        description="현재 학급의 실제 입력 데이터를 기준으로 현황을 확인합니다."
        actions={<LinkButton href={`/teacher?class=${classCode}&view=students`}>학생 관리</LinkButton>}
      />
      <PageSection>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="전체 학생 수" value={`${totalStudents}명`} description="현재 인증 학급" icon="students" />
          <MetricCard label={`작성 ${STUDENT_STATUS_LABEL.done}`} value={`${doneCount}명`} description="지원대학 입력 + 체크리스트 전체 제출" icon="check" />
          <MetricCard label={`작성 ${STUDENT_STATUS_LABEL.in_progress}`} value={`${inProgressCount}명`} description="지원대학은 입력, 체크리스트 진행 중" icon="progress" />
          <MetricCard label={STUDENT_STATUS_LABEL.not_started} value={`${notStartedCount}명`} description="지원대학 미입력" icon="pending" />
        </div>
      </PageSection>

      <div className="grid gap-5 xl:grid-cols-3">
        <PageSection title="진행 현황" description="작성 완료 학생 비율(화면 자동 계산 기준)입니다.">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-6">
              {totalStudents === 0 ? (
                <EmptyState title="현재 등록된 학생이 없습니다" description="학생 관리에서 학생을 등록하면 현황이 표시됩니다." />
              ) : (
                <>
                  <ProgressDonut percent={completionRate} />
                  <p className="text-sm text-muted">{doneCount} / {totalStudents}명 작성 완료</p>
                </>
              )}
            </CardContent>
          </Card>
        </PageSection>

        <PageSection title="최근 작성 학생" description="지원대학·체크리스트가 가장 최근 수정된 학생입니다.">
          <Card>
            <CardContent className="p-3">
              {recentStudents.length === 0 ? (
                <EmptyState className="m-2" title="아직 수정 이력이 없습니다" description="학생이 지원대학이나 체크리스트를 입력하면 표시됩니다." />
              ) : (
                <ul className="divide-y divide-line">
                  {recentStudents.map((student) => (
                    <li key={student.id} className="flex items-center justify-between gap-3 px-2 py-3">
                      <Link href={`/teacher/students/${student.id}?class=${classCode}`} className="min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                        <p className="truncate text-sm font-semibold text-slate-900">{student.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{formatLastModified(student.stats.lastModifiedAt)}</p>
                      </Link>
                      <StatusBadge tone={STATUS_TONE[student.stats.status]} className="shrink-0">{STUDENT_STATUS_LABEL[student.stats.status]}</StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </PageSection>

        <PageSection title="공지사항">
          <Card>
            <CardContent className="p-6">
              <EmptyState title="공지사항 기능은 준비 중입니다" description="별도 데이터나 임시 공지는 표시하지 않습니다." />
            </CardContent>
          </Card>
        </PageSection>
      </div>
    </PageContainer>
  );
}

function ProgressDonut({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg viewBox="0 0 140 140" className="size-32" role="img" aria-label={`작성 완료율 ${percent}%`}>
      <circle cx="70" cy="70" r={radius} strokeWidth="14" className="fill-none stroke-line" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        className="fill-none stroke-brand"
      />
      <text x="70" y="66" textAnchor="middle" className="fill-navy text-[26px] font-bold">{percent}%</text>
      <text x="70" y="86" textAnchor="middle" className="fill-muted text-[10px]">작성 완료율</text>
    </svg>
  );
}

function formatLastModified(iso: string | null) {
  if (!iso) return "-";
  return iso.slice(0, 16).replace("T", " ");
}

type MetricIconName = "students" | "check" | "progress" | "pending";

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
    progress: <svg {...common}><path d="M4 20 14 10l4 4-10 10H4v-4Z" /><path d="m13 11 4-4 4 4-4 4" /></svg>,
    pending: <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3.2 2" /></svg>,
  };
  return icons[name];
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-navy bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">{children}</Link>;
}
