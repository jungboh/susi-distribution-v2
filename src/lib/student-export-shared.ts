import type { Application, ChecklistItem, Student } from "@/lib/types";

export const EXPORT_SCHOOL_YEAR = 2026;
export const EXPORT_SCHOOL_NAME = "영동미래고등학교";
export const EXPORT_DOCUMENT_TITLE = "2026학년도 수시 지원 현황";

export type StudentExportData = {
  student: Student;
  applications: Application[];
  checklistItems: ChecklistItem[];
};

export function getFilledApplications(applications: Application[]) {
  return applications.filter((application) => application.university_name.trim());
}

export function displayValue(value: string | null | undefined) {
  return value?.trim() || "-";
}

export function formatExportDate(value: string | null | undefined) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${year}. ${month}. ${day}.` : value;
}

export function formatGeneratedDate(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function sanitizeFilenamePart(value: string) {
  const sanitized = value
    .normalize("NFC")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[. ]+$/g, "")
    .slice(0, 60);
  return sanitized || "학생";
}
