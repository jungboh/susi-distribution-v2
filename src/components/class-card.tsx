import Link from "next/link";
import type { ReactNode } from "react";
import { CLASS_UI_NAME_BY_CODE, type ClassCode } from "@/lib/class-codes";

export function ClassCard({ classCode }: { classCode: ClassCode }) {
  const className = CLASS_UI_NAME_BY_CODE[classCode];

  return (
    <div className="group flex min-h-56 flex-col items-center gap-4 rounded-xl border border-white/30 bg-gradient-to-b from-[#7899bf] to-[#567da9] p-5 text-center text-white shadow-[0_12px_24px_rgb(21_56_96/0.16)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgb(21_56_96/0.22)] first:bg-gradient-to-b first:from-[#15569b] first:to-[#073a78]">
      <div className="flex size-20 items-center justify-center text-white">
        <ClassIcon classCode={classCode} />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{className}</h2>
      <Link
        href={`/teacher?class=${classCode}`}
        className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/80 bg-[#07366f]/90 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#062d5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        aria-label={`${className} 로그인`}
      >
        로그인
      </Link>
    </div>
  );
}

function ClassIcon({ classCode }: { classCode: ClassCode }) {
  const common = {
    className: "size-16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true,
  } as const;

  const icons: Record<ClassCode, ReactNode> = {
    finance: (
      <svg {...common}>
        <path d="M4 9h16M5 9V6l7-3 7 3v3M6 9v8m4-8v8m4-8v8m4-8v8M4 20h16" />
      </svg>
    ),
    startup: (
      <svg {...common}>
        <path d="M9 18h6m-5 3h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-1 .8-1.5 1.6-1.5 2.5h-4c0-.9-.5-1.7-1.5-2.5Z" />
      </svg>
    ),
    distribution: (
      <svg {...common}>
        <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H6" />
        <circle cx="9.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
    health: (
      <svg {...common}>
        <path d="M12 21S4 16.5 4 10a4 4 0 0 1 7-2.7A4 4 0 0 1 20 10c0 6.5-8 11-8 11Z" />
        <path d="M12 8v6m-3-3h6" />
      </svg>
    ),
  };

  return icons[classCode];
}
