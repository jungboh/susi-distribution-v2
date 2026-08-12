import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { CLASS_UI_NAME_BY_CODE, type ClassCode } from "@/lib/class-codes";

const descriptions: Record<ClassCode, string> = {
  finance: "금융 분야 진학 자료를 관리합니다.",
  startup: "창업 분야 진학 자료를 관리합니다.",
  distribution: "유통 분야 진학 자료를 관리합니다.",
  health: "보건 분야 진학 자료를 관리합니다.",
};

export function ClassCard({ classCode }: { classCode: ClassCode }) {
  const className = CLASS_UI_NAME_BY_CODE[classCode];

  return (
    <Card className="group flex min-h-64 flex-col p-5 transition-colors duration-150 hover:border-blue-300">
      <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-navy">
        <ClassIcon classCode={classCode} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{className}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">
        {descriptions[classCode]}
      </p>
      <Link
        href={`/teacher?class=${classCode}`}
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-navy bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-label={`${className} 관리 시작`}
      >
        관리 시작
      </Link>
    </Card>
  );
}

function ClassIcon({ classCode }: { classCode: ClassCode }) {
  const common = {
    className: "size-7",
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
        <path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" />
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
