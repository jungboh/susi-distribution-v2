import type { ClassCode } from "@/lib/class-codes";

export type Student = {
  id: string;
  name: string;
  student_number: string | null;
  access_code: string;
  class_code: ClassCode;
  created_at: string;
};

export type Application = {
  id: string;
  student_id: string;
  seq: number;
  region: string;
  university_name: string;
  department: string;
  admission_type: string;
  admission_name: string;
  admission_method: string;
  csat_min_grade: string;
  recruit_count: string;
  prev_recruit_count: string;
  required_documents: string;
  apply_start_date: string | null;
  document_submit_date: string | null;
  stage1_announce_date: string | null;
  interview_date: string | null;
  final_announce_date: string | null;
  my_grade: string;
  prev_avg_grade: string;
  note: string;
  updated_at: string;
};

export type ApplicationPatch = Partial<
  Omit<Application, "id" | "student_id" | "seq" | "updated_at">
>;

export type ChecklistItem = {
  id: string;
  student_id: string;
  application_id: string | null;
  label: string;
  is_submitted: boolean;
  note: string;
  sort_order: number;
  updated_at: string;
};

export const ADMISSION_TYPES = [
  "학생부교과",
  "학생부종합",
  "논술",
  "실기/실적",
  "기타",
] as const;

export const MIN_APPLICATION_ROWS = 6;
export const MAX_APPLICATION_ROWS = 15;
