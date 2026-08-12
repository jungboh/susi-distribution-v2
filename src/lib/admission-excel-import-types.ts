import type { ParsedAdmissionExcelRow } from "@/lib/admission-excel";
import type { ImportMatchStatus } from "@/lib/interest-import-types";

export type ExcelImportDecision = "add" | "fill" | "update" | "duplicate" | "skip";

export type AdmissionExcelPreviewRow = ParsedAdmissionExcelRow & {
  matchStatus: ImportMatchStatus;
  matchedStudentId: string | null;
  matchedStudentName: string | null;
  existingApplicationId: string | null;
  decision: ExcelImportDecision;
  fillCandidates: Array<{ field: string; existing: string; excel: string }>;
  conflicts: Array<{ field: string; existing: string; excel: string }>;
};

export type AdmissionExcelPreview = {
  fileName: string;
  fileSize: number;
  rows: AdmissionExcelPreviewRow[];
  students: Array<{ id: string; name: string; studentNumber: string | null }>;
  summary: {
    total: number;
    studentCount: number;
    exact: number;
    review: number;
    unmatched: number;
    additions: number;
    duplicates: number;
    fills: number;
    updates: number;
  };
};
