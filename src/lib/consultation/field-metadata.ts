import type { Application } from "@/lib/types";

export type ConsultationFieldName =
  | "university_name" | "department" | "admission_type" | "admission_name"
  | "admission_method" | "csat_min_grade" | "recruit_count"
  | "required_documents" | "my_grade" | "prev_avg_grade"
  | "first_pass_cut" | "cut_70" | "additional_pass_cut" | "note" | "remarks"
  | "establishment_type"
  | `result_${2023 | 2024 | 2025 | 2026}_${"cut_50" | "cut_70" | "competition_rate" | "additional_admits"}`
  | "apply_period_text" | "document_submit_period_text" | "stage1_announce_text"
  | "interview_schedule_text" | "final_announce_text";

export type ConsultationStage = "common" | "first_consultation" | "second_consultation" | "memo";
export type ConsultationDisplayFormat = "text" | "select" | "multiline" | "result" | "schedule";

export type ConsultationFieldMetadata = {
  field: ConsultationFieldName;
  label: string;
  stage: ConsultationStage;
  section: "basic" | "conditions" | "grade" | "legacy_result" | "yearly_result" | "documents" | "schedule" | "memo";
  format: ConsultationDisplayFormat;
  source: "existing" | "new";
  teacherUi: "edit";
  studentUi: "inherit-existing" | "read-only";
  emptyDisplay: "dash" | "not-entered";
};

export const EXISTING_CONSULTATION_FIELDS = [
  "university_name", "department", "admission_type", "admission_name",
  "admission_method", "csat_min_grade", "recruit_count", "required_documents",
  "my_grade", "prev_avg_grade", "first_pass_cut", "cut_70",
  "additional_pass_cut", "note", "remarks",
] as const satisfies readonly (keyof Application)[];

export const NEW_CONSULTATION_FIELDS = [
  "establishment_type",
  "result_2023_cut_50", "result_2023_cut_70", "result_2023_competition_rate", "result_2023_additional_admits",
  "result_2024_cut_50", "result_2024_cut_70", "result_2024_competition_rate", "result_2024_additional_admits",
  "result_2025_cut_50", "result_2025_cut_70", "result_2025_competition_rate", "result_2025_additional_admits",
  "result_2026_cut_50", "result_2026_cut_70", "result_2026_competition_rate", "result_2026_additional_admits",
  "apply_period_text", "document_submit_period_text", "stage1_announce_text", "interview_schedule_text", "final_announce_text",
] as const satisfies readonly (keyof Application)[];

const existing = (field: ConsultationFieldName, label: string, stage: ConsultationStage, section: ConsultationFieldMetadata["section"], format: ConsultationDisplayFormat = "text"): ConsultationFieldMetadata => ({ field, label, stage, section, format, source: "existing", teacherUi: "edit", studentUi: "inherit-existing", emptyDisplay: "not-entered" });
const added = (field: ConsultationFieldName, label: string, stage: ConsultationStage, section: ConsultationFieldMetadata["section"], format: ConsultationDisplayFormat, emptyDisplay: ConsultationFieldMetadata["emptyDisplay"] = "dash"): ConsultationFieldMetadata => ({ field, label, stage, section, format, source: "new", teacherUi: "edit", studentUi: "read-only", emptyDisplay });

export const CONSULTATION_FIELD_METADATA: readonly ConsultationFieldMetadata[] = [
  existing("university_name", "지원대학", "common", "basic"),
  existing("department", "모집단위(학부·학과)", "common", "basic"),
  existing("admission_type", "전형유형", "common", "basic", "select"),
  existing("admission_name", "전형명", "common", "basic"),
  existing("recruit_count", "모집인원", "common", "basic"),
  added("establishment_type", "설립 구분", "common", "basic", "text"),
  existing("admission_method", "전형방법", "first_consultation", "conditions", "multiline"),
  existing("csat_min_grade", "수능 최저등급", "first_consultation", "conditions"),
  existing("my_grade", "나의 내신", "first_consultation", "grade"),
  existing("prev_avg_grade", "전년평균", "first_consultation", "legacy_result"),
  existing("first_pass_cut", "전년합격컷", "first_consultation", "legacy_result"),
  existing("cut_70", "70%컷", "first_consultation", "legacy_result"),
  existing("additional_pass_cut", "추가합격 성적 컷", "first_consultation", "legacy_result"),
  ...([2023, 2024, 2025, 2026] as const).flatMap((year) => [
    added(`result_${year}_cut_50`, `${year} 50% 컷`, "first_consultation", "yearly_result", "result"),
    added(`result_${year}_cut_70`, `${year} 70% 컷`, "first_consultation", "yearly_result", "result"),
    added(`result_${year}_competition_rate`, `${year} 경쟁률`, "first_consultation", "yearly_result", "result"),
    added(`result_${year}_additional_admits`, `${year} 추가합격 인원`, "first_consultation", "yearly_result", "result"),
  ]),
  existing("required_documents", "제출서류", "second_consultation", "documents", "multiline"),
  added("apply_period_text", "원서접수 기간", "second_consultation", "schedule", "schedule", "not-entered"),
  added("document_submit_period_text", "서류 제출 기간", "second_consultation", "schedule", "schedule", "not-entered"),
  added("stage1_announce_text", "1단계 발표", "second_consultation", "schedule", "schedule", "not-entered"),
  added("interview_schedule_text", "면접 일정", "second_consultation", "schedule", "schedule", "not-entered"),
  added("final_announce_text", "최종 발표", "second_consultation", "schedule", "schedule", "not-entered"),
  existing("note", "비고", "memo", "memo", "multiline"),
  existing("remarks", "추가 비고", "memo", "memo", "multiline"),
] as const;

export const CONSULTATION_STAGE_LABELS: Record<ConsultationStage, string> = {
  common: "공통 기본정보", first_consultation: "1차 상담", second_consultation: "2차 상담", memo: "메모·비고",
};

export function displayConsultationValue(value: string | null | undefined, emptyDisplay: ConsultationFieldMetadata["emptyDisplay"] = "dash") {
  if (value == null || value.trim() === "") return emptyDisplay === "not-entered" ? "아직 입력되지 않음" : "-";
  return value;
}
