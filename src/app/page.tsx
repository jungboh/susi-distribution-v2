import { ClassCard } from "@/components/class-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageContainer } from "@/components/ui/page-layout";
import { LANDING_CLASS_CODES } from "@/lib/class-codes";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <main className="relative flex flex-1 items-center overflow-hidden py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,hsl(var(--color-brand)/0.12),transparent_68%)]"
        />
        <PageContainer className="relative max-w-6xl">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-lg font-bold tracking-tight text-navy sm:text-xl">
              영동미래고등학교
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              2026학년도 수시자료 취합 시스템
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted sm:text-base">
              담임 선생님은 관리할 학급을 선택해 주세요.
            </p>
          </header>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_CLASS_CODES.map((classCode) => (
              <ClassCard key={classCode} classCode={classCode} />
            ))}
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </div>
  );
}
