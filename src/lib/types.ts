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
  // 금융과 전용 필드. 다른 학급에서는 항상 빈 문자열/기본값이다.
  major_series: string;
  stage1_elements: string;
  season: string;
  selection_type: string;
  first_pass_cut: string;
  cut_70: string;
  additional_pass_cut: string;
  my_score: string;
  remarks: string;
  data_source: string;
  import_batch_id: string | null;
  establishment_type: string | null;
  result_2023_cut_50: string | null;
  result_2023_cut_70: string | null;
  result_2023_competition_rate: string | null;
  result_2023_additional_admits: string | null;
  result_2024_cut_50: string | null;
  result_2024_cut_70: string | null;
  result_2024_competition_rate: string | null;
  result_2024_additional_admits: string | null;
  result_2025_cut_50: string | null;
  result_2025_cut_70: string | null;
  result_2025_competition_rate: string | null;
  result_2025_additional_admits: string | null;
  result_2026_cut_50: string | null;
  result_2026_cut_70: string | null;
  result_2026_competition_rate: string | null;
  result_2026_additional_admits: string | null;
  apply_period_text: string | null;
  document_submit_period_text: string | null;
  stage1_announce_text: string | null;
  interview_schedule_text: string | null;
  final_announce_text: string | null;
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
// 금융과는 기존 시스템에서 학생당 최대 50개 지원 행을 허용했다.
export const MAX_APPLICATION_ROWS = 50;
