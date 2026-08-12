import { cx } from "@/lib/ui";

export function SiteFooter({ student = false }: { student?: boolean }) {
  return (
    <footer
      className={cx(
        "mt-10 bg-navy px-4 py-4 text-slate-200 print:hidden",
        student && "student-copyright"
      )}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-2 text-center text-xs sm:flex-row sm:text-left">
        <p>© 2026 jungboh All rights reserved.</p>
        <p className="flex items-center gap-2 text-slate-300" aria-label="정책 안내">
          <span>개인정보처리방침</span>
          <span aria-hidden="true">|</span>
          <span>이용안내</span>
        </p>
      </div>
    </footer>
  );
}
