import { ClassCard } from "@/components/class-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageContainer } from "@/components/ui/page-layout";
import { LANDING_CLASS_CODES } from "@/lib/class-codes";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <main className="landing-hero relative flex flex-1 items-center overflow-hidden py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,hsl(var(--color-brand)/0.12),transparent_68%)]"
        />
        <PageContainer className="relative z-10 max-w-6xl">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl lg:text-4xl">
              영동미래고등학교
            </p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl lg:text-4xl">
              2026학년도 수시자료 취합 시스템
            </h1>
            <p className="mt-5 text-sm font-medium leading-6 text-slate-700 sm:text-base">
              담임 선생님은 관리할 학급을 선택해 주세요.
            </p>
          </header>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5">
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
