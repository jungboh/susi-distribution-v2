import type { ParsedInterestRow } from "@/lib/interest-pdf";

export type ImportMatchStatus = "exact" | "review" | "unmatched";
export type ImportDecision = "add" | "update" | "skip";

export type InterestPreviewRow = ParsedInterestRow & {
  matchStatus: ImportMatchStatus;
  matchedStudentId: string | null;
  matchedStudentName: string | null;
  existingApplicationId: string | null;
  decision: ImportDecision;
  comparison: Array<{ field: string; existing: string; pdf: string }>;
};

export type InterestPreview = {
  fileName: string;
  fileSize: number;
  rows: InterestPreviewRow[];
  students: Array<{ id: string; name: string; studentNumber: string | null }>;
  summary: {
    total: number;
    exact: number;
    review: number;
    unmatched: number;
    additions: number;
    duplicates: number;
    updates: number;
  };
};

export type ImportSelection = {
  row: ParsedInterestRow;
  decision: ImportDecision;
  targetStudentId: string | null;
  existingApplicationId: string | null;
};

export type ImportResult = {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  failures: string[];
};
