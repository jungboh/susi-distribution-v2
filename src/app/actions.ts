"use server";

import { revalidatePath } from "next/cache";
import * as data from "@/lib/data";
import { ApplicationPatch } from "@/lib/types";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";
import { DEFAULT_CLASS_CODE, isClassCode } from "@/lib/class-codes";

const TEACHER_APPLICATION_FIELD_NAMES = new Set<keyof ApplicationPatch>([
  "region",
  "university_name",
  "department",
  "admission_type",
  "admission_name",
  "admission_method",
  "csat_min_grade",
  "recruit_count",
  "prev_recruit_count",
  "required_documents",
  "apply_start_date",
  "document_submit_date",
  "stage1_announce_date",
  "interview_date",
  "final_announce_date",
  "my_grade",
  "prev_avg_grade",
  "note",
  "major_series",
  "stage1_elements",
  "season",
  "selection_type",
  "first_pass_cut",
  "cut_70",
  "additional_pass_cut",
  "my_score",
  "remarks",
  "establishment_type",
  "result_2023_cut_50",
  "result_2023_cut_70",
  "result_2023_competition_rate",
  "result_2023_additional_admits",
  "result_2024_cut_50",
  "result_2024_cut_70",
  "result_2024_competition_rate",
  "result_2024_additional_admits",
  "result_2025_cut_50",
  "result_2025_cut_70",
  "result_2025_competition_rate",
  "result_2025_additional_admits",
  "result_2026_cut_50",
  "result_2026_cut_70",
  "result_2026_competition_rate",
  "result_2026_additional_admits",
  "apply_period_text",
  "document_submit_period_text",
  "stage1_announce_text",
  "interview_schedule_text",
  "final_announce_text",
]);

const STUDENT_APPLICATION_FIELD_NAMES = new Set<keyof ApplicationPatch>([
  "region",
  "university_name",
  "department",
  "admission_type",
  "admission_name",
  "recruit_count",
  "required_documents",
  "apply_period_text",
  "document_submit_period_text",
  "stage1_announce_text",
  "interview_schedule_text",
  "final_announce_text",
]);

const NULLABLE_DATE_FIELDS = new Set<keyof ApplicationPatch>([
  "apply_start_date",
  "document_submit_date",
  "stage1_announce_date",
  "interview_date",
  "final_announce_date",
]);

const NULLABLE_TEXT_FIELDS = new Set<keyof ApplicationPatch>([
  "establishment_type",
  "result_2023_cut_50",
  "result_2023_cut_70",
  "result_2023_competition_rate",
  "result_2023_additional_admits",
  "result_2024_cut_50",
  "result_2024_cut_70",
  "result_2024_competition_rate",
  "result_2024_additional_admits",
  "result_2025_cut_50",
  "result_2025_cut_70",
  "result_2025_competition_rate",
  "result_2025_additional_admits",
  "result_2026_cut_50",
  "result_2026_cut_70",
  "result_2026_competition_rate",
  "result_2026_additional_admits",
  "apply_period_text",
  "document_submit_period_text",
  "stage1_announce_text",
  "interview_schedule_text",
  "final_announce_text",
]);

const AUTHORIZATION_ERROR = "요청을 처리할 권한이 없습니다.";

function denyAccess(): never {
  throw new Error(AUTHORIZATION_ERROR);
}

function revalidateMutationPaths(accessCode: string | null) {
  if (accessCode) {
    revalidatePath(`/apply/${accessCode}`);
  } else {
    revalidatePath("/teacher");
  }
}

async function resolveStudentFromAccessCode(accessCode: string) {
  try {
    const student = await data.getStudentByCode(accessCode);
    if (!student) denyAccess();
    return student;
  } catch {
    denyAccess();
  }
}

async function authorizeTeacherStudent(studentId: string) {
  try {
    const [session, student] = await Promise.all([
      readVerifiedTeacherClassSession(),
      data.getStudentById(studentId),
    ]);
    if (!session || !student || session.classCode !== student.class_code) {
      denyAccess();
    }
    return student;
  } catch {
    denyAccess();
  }
}

async function authorizeApplication(
  accessCode: string | null,
  applicationId: string
) {
  try {
    const ownerId = await data.getApplicationOwnerId(applicationId);
    if (!ownerId) denyAccess();

    if (accessCode) {
      const student = await resolveStudentFromAccessCode(accessCode);
      if (ownerId !== student.id) denyAccess();
    } else {
      await authorizeTeacherStudent(ownerId);
    }

    return ownerId;
  } catch {
    denyAccess();
  }
}

async function authorizeChecklistItem(accessCode: string | null, itemId: string) {
  try {
    const item = await data.getChecklistOwnership(itemId);
    if (!item?.application_id) denyAccess();

    const applicationOwnerId = await data.getApplicationOwnerId(
      item.application_id
    );
    if (!applicationOwnerId || item.student_id !== applicationOwnerId) denyAccess();

    if (accessCode) {
      const student = await resolveStudentFromAccessCode(accessCode);
      if (applicationOwnerId !== student.id) denyAccess();
    } else {
      await authorizeTeacherStudent(applicationOwnerId);
    }
  } catch {
    denyAccess();
  }
}

export async function updateApplicationFieldAction(
  accessCode: string | null,
  applicationId: string,
  field: keyof ApplicationPatch,
  value: string | null | undefined
) {
  const allowedFields = accessCode
    ? STUDENT_APPLICATION_FIELD_NAMES
    : TEACHER_APPLICATION_FIELD_NAMES;
  if (!allowedFields.has(field)) {
    throw new Error("허용되지 않은 필드입니다.");
  }
  await authorizeApplication(accessCode, applicationId);
  if (value === undefined) {
    return data.getApplicationById(applicationId);
  }
  const normalizedValue = NULLABLE_TEXT_FIELDS.has(field)
    ? value === null || value.trim() === "" ? null : value
    : NULLABLE_DATE_FIELDS.has(field)
      ? value?.trim() || null
      : value ?? "";
  const application = await data.updateApplication(applicationId, {
    [field]: normalizedValue,
  } as ApplicationPatch);
  revalidateMutationPaths(accessCode);
  return application;
}

export async function addApplicationRowAction(
  accessCode: string | null,
  requestedStudentId: string
) {
  const studentId = accessCode
    ? (await resolveStudentFromAccessCode(accessCode)).id
    : (await authorizeTeacherStudent(requestedStudentId)).id;
  const application = await data.addApplicationRow(studentId);
  revalidateMutationPaths(accessCode);
  return application;
}

export async function deleteApplicationRowAction(
  accessCode: string | null,
  applicationId: string
) {
  const ownerId = await authorizeApplication(accessCode, applicationId);
  await data.deleteApplicationRow(applicationId, ownerId);
  revalidateMutationPaths(accessCode);
}

export async function addChecklistItemAction(
  accessCode: string | null,
  applicationId: string | null,
  label: string
) {
  const trimmed = label.trim();
  if (!trimmed) throw new Error("서류명을 입력해주세요.");
  if (!applicationId) throw new Error("학교를 선택해주세요.");
  const ownerId = await authorizeApplication(accessCode, applicationId);
  const item = await data.addChecklistItem(ownerId, applicationId, trimmed);
  revalidateMutationPaths(accessCode);
  return item;
}

export async function toggleChecklistItemAction(
  accessCode: string | null,
  id: string,
  isSubmitted: boolean
) {
  await authorizeChecklistItem(accessCode, id);
  const item = await data.toggleChecklistItem(id, isSubmitted);
  revalidateMutationPaths(accessCode);
  return item;
}

export async function updateChecklistNoteAction(
  accessCode: string | null,
  id: string,
  note: string
) {
  await authorizeChecklistItem(accessCode, id);
  const item = await data.updateChecklistNote(id, note);
  revalidateMutationPaths(accessCode);
  return item;
}

export async function deleteChecklistItemAction(
  accessCode: string | null,
  id: string
) {
  await authorizeChecklistItem(accessCode, id);
  await data.deleteChecklistItem(id);
  revalidateMutationPaths(accessCode);
}

export async function createStudentAction(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") ?? "").trim();
  const studentNumber = String(formData.get("student_number") ?? "").trim();
  const requestedClassCode = String(
    formData.get("class_code") ?? DEFAULT_CLASS_CODE
  );

  if (!name) {
    return { error: "이름을 입력해주세요." };
  }

  if (!isClassCode(requestedClassCode)) {
    return { error: "올바른 학급을 선택해주세요." };
  }

  const session = await readVerifiedTeacherClassSession();
  if (!session || session.classCode !== requestedClassCode) {
    return { error: "해당 학급의 담임 인증이 필요합니다." };
  }

  await data.createStudent(name, studentNumber, requestedClassCode);
  return { error: "" };
}

export async function deleteStudentAction(studentId: string) {
  await authorizeTeacherStudent(studentId);
  await data.deleteStudent(studentId);
}
