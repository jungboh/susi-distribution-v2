"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { lockTeacherClassAction } from "@/app/teacher/auth-actions";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { CLASS_UI_NAME_BY_CODE, type ClassCode } from "@/lib/class-codes";
import { cx } from "@/lib/ui";

type TeacherView = "dashboard" | "students" | "links";

export function TeacherAppShell({ classCode, view, title, children }: { classCode: ClassCode; view: TeacherView; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const className = CLASS_UI_NAME_BY_CODE[classCode];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {open && <button type="button" aria-label="메뉴 닫기" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setOpen(false)} />}
      <aside id="teacher-navigation" className={cx("fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col bg-navy text-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none", open && "translate-x-0")}>
        <div className="border-b border-white/10 px-5 py-6"><p className="text-xs font-semibold text-blue-200">영동미래고등학교</p><p className="mt-2 text-xl font-bold">{className}</p><p className="mt-1 text-xs text-slate-300">2026학년도 수시자료 관리</p></div>
        <nav aria-label="담임 메뉴" className="flex-1 space-y-1 px-3 py-5">
          <NavLink href={`/teacher?class=${classCode}`} active={view === "dashboard"} icon="dashboard" onClick={() => setOpen(false)}>대시보드</NavLink>
          <NavLink href={`/teacher?class=${classCode}&view=students`} active={view === "students"} icon="students" onClick={() => setOpen(false)}>학생 관리</NavLink>
          <NavLink href={`/teacher?class=${classCode}&view=links`} active={view === "links"} icon="links" onClick={() => setOpen(false)}>링크 관리</NavLink>
          {(["download", "notice", "settings"] as const).map((icon) => <div key={icon} className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm text-slate-400" aria-disabled="true"><span className="flex items-center gap-3"><NavIcon name={icon} />{NAV_DISABLED_LABEL[icon]}</span><span className="text-[10px] font-semibold">준비 중</span></div>)}
        </nav>
        <div className="border-t border-white/10 p-3 lg:hidden"><button type="button" onClick={() => setOpen(false)} className="min-h-10 w-full rounded-lg text-sm font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">메뉴 닫기</button></div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur"><div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="담임 메뉴 열기" aria-controls="teacher-navigation" aria-expanded={open} onClick={() => setOpen(true)} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"><span aria-hidden="true" className="text-xl">☰</span></button><div className="min-w-0"><h1 className="truncate text-base font-bold text-slate-900 sm:text-xl">{title}</h1><p className="truncate text-xs text-muted sm:hidden">{className} · 2026학년도</p></div></div><div className="flex shrink-0 items-center gap-2"><span className="hidden rounded-lg border border-line bg-subtle px-3 py-2 text-xs font-semibold text-slate-700 sm:inline-flex">2026학년도</span><span className="hidden text-xs font-semibold text-slate-600 md:inline">{className} 담임</span><form action={lockTeacherClassAction}><Button type="submit" variant="secondary" size="sm" className="px-2.5 sm:px-3">로그아웃</Button></form></div></div></header>
        <main className="flex-1">{children}</main><SiteFooter />
      </div>
    </div>
  );
}

type NavIconName = "dashboard" | "students" | "links" | "download" | "notice" | "settings";

const NAV_DISABLED_LABEL: Record<"download" | "notice" | "settings", string> = {
  download: "출력/다운로드",
  notice: "공지사항",
  settings: "설정",
};

function NavLink({ href, active, icon, onClick, children }: { href: string; active: boolean; icon: NavIconName; onClick: () => void; children: ReactNode }) {
  return <Link href={href} aria-current={active ? "page" : undefined} onClick={onClick} className={cx("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300", active ? "bg-white text-navy" : "text-slate-200 hover:bg-white/10 hover:text-white")}><NavIcon name={icon} />{children}</Link>;
}

function NavIcon({ name }: { name: NavIconName }) {
  const common = { className: "size-5 shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  const icons: Record<NavIconName, ReactNode> = {
    dashboard: <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
    students: <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.5-3.5 3-5.2 5.5-5.2s5 1.7 5.5 5.2" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 13.3c2 .2 3.8 1.7 4.2 4.2" /></svg>,
    links: <svg {...common}><path d="m9.5 14.5 5-5" /><path d="M11 6.5 12.6 4.9a3.6 3.6 0 0 1 5.1 5.1L16 11.6" /><path d="M13 17.5 11.4 19.1a3.6 3.6 0 0 1-5.1-5.1L8 12.4" /></svg>,
    download: <svg {...common}><path d="M12 4v11" /><path d="m8 11.5 4 4 4-4" /><path d="M5 19h14" /></svg>,
    notice: <svg {...common}><path d="M3 10v4a1 1 0 0 0 1 1h2l7 4V5L6 9H4a1 1 0 0 0-1 1Z" /><path d="M17 9a4 4 0 0 1 0 6" /></svg>,
    settings: <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.7-6.7-1.4 1.4M7.7 16.3l-1.4 1.4m0-11.4 1.4 1.4m9.6 9.6 1.4 1.4" /></svg>,
  };
  return icons[name];
}
