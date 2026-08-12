import "server-only";
import { randomBytes } from "crypto";
import { getSupabaseAdmin as createDataClient } from "@/lib/supabase-admin";
import { getServerEnvStatus, logServerEvent } from "@/lib/server-debug";
import type { ClassCode } from "@/lib/class-codes";
import { CLASS_CODES } from "@/lib/class-codes";
import {
  Application,
  ApplicationPatch,
  ChecklistItem,
  MAX_APPLICATION_ROWS,
  MIN_APPLICATION_ROWS,
  Student,
} from "@/lib/types";

function getSupabaseAdmin() {
  logServerEvent("data.before-supabase-call", getServerEnvStatus());
  return createDataClient();
}

function generateAccessCode() {
  return randomBytes(4).toString("hex");
}

export async function listStudents(classCode: ClassCode, search?: string) {
  const supabaseAdmin = getSupabaseAdmin();
  let query = supabaseAdmin
    .from("susi_class2_students")
    .select("*")
    .eq("class_code", classCode)
    .order("created_at", { ascending: true });

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`name.ilike.%${term}%,student_number.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Student[];
}

export async function listClassStudentCounts() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_students")
    .select("class_code");

  if (error) throw error;

  const counts = Object.fromEntries(
    CLASS_CODES.map((code) => [code, 0])
  ) as Record<ClassCode, number>;

  for (const row of data ?? []) {
    if ((CLASS_CODES as readonly string[]).includes(row.class_code)) {
      counts[row.class_code as ClassCode] += 1;
    }
  }

  return counts;
}

export async function createStudent(
  name: string,
  studentNumber: string,
  classCode: ClassCode
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_students")
    .insert({
      name,
      student_number: studentNumber || null,
      access_code: generateAccessCode(),
      class_code: classCode,
    })
    .select("*")
    .single();

  if (error) throw error;

  await ensureMinimumRows(data.id);

  return data as Student;
}

export async function deleteStudent(studentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("susi_class2_students")
    .delete()
    .eq("id", studentId);
  if (error) throw error;
}

export async function getStudentByCode(code: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_students")
    .select("*")
    .eq("access_code", code)
    .maybeSingle();

  if (error) throw error;
  return data as Student | null;
}

export async function getStudentById(id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_students")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Student | null;
}

export async function listApplications(studentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_applications")
    .select("*")
    .eq("student_id", studentId)
    .order("seq", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Application[];
}

export async function getApplicationOwnerId(applicationId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_applications")
    .select("student_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  return data?.student_id as string | undefined;
}

export async function getApplicationById(applicationId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("지원 정보를 찾을 수 없습니다.");
  return data as Application;
}

export async function ensureMinimumRows(studentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const existing = await listApplications(studentId);
  if (existing.length >= MIN_APPLICATION_ROWS) return existing;

  const rowsToCreate = MIN_APPLICATION_ROWS - existing.length;
  const nextSeqStart =
    existing.length > 0 ? Math.max(...existing.map((r) => r.seq)) + 1 : 1;

  const inserts = Array.from({ length: rowsToCreate }, (_, i) => ({
    student_id: studentId,
    seq: nextSeqStart + i,
  }));

  const { error } = await supabaseAdmin.from("susi_class2_applications").insert(inserts);
  if (error) throw error;

  return listApplications(studentId);
}

export async function addApplicationRow(studentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const existing = await listApplications(studentId);
  if (existing.length >= MAX_APPLICATION_ROWS) {
    throw new Error(`대학은 최대 ${MAX_APPLICATION_ROWS}개까지 작성할 수 있습니다.`);
  }

  const nextSeq =
    existing.length > 0 ? Math.max(...existing.map((r) => r.seq)) + 1 : 1;

  const { data, error } = await supabaseAdmin
    .from("susi_class2_applications")
    .insert({ student_id: studentId, seq: nextSeq })
    .select("*")
    .single();

  if (error) throw error;
  return data as Application;
}

export async function deleteApplicationRow(applicationId: string, studentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("susi_class2_applications")
    .delete()
    .eq("id", applicationId);
  if (error) throw error;

  const remaining = await listApplications(studentId);
  await Promise.all(
    remaining.map((row, index) =>
      row.seq === index + 1
        ? Promise.resolve()
        : supabaseAdmin
            .from("susi_class2_applications")
            .update({ seq: index + 1 })
            .eq("id", row.id)
    )
  );
}

export async function updateApplication(
  applicationId: string,
  patch: ApplicationPatch
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_applications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Application;
}

export async function getStudentStats(studentId: string) {
  const [apps, checklist] = await Promise.all([
    listApplications(studentId),
    listChecklist(studentId),
  ]);
  const filledCount = apps.filter((a) => a.university_name.trim()).length;
  const checklistTotal = checklist.length;
  const checklistDone = checklist.filter((c) => c.is_submitted).length;
  return { filledCount, checklistTotal, checklistDone };
}

export async function listStudentsWithStats(
  classCode: ClassCode,
  search?: string
) {
  const students = await listStudents(classCode, search);
  const stats = await Promise.all(students.map((s) => getStudentStats(s.id)));
  return students.map((s, i) => ({ ...s, stats: stats[i] }));
}

export async function listChecklist(studentId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_checklist_items")
    .select("*")
    .eq("student_id", studentId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChecklistItem[];
}

export async function getChecklistOwnership(id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_checklist_items")
    .select("student_id,application_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Pick<ChecklistItem, "student_id" | "application_id"> | null;
}

export async function addChecklistItem(
  studentId: string,
  applicationId: string | null,
  label: string
) {
  const supabaseAdmin = getSupabaseAdmin();
  const existing = await listChecklist(studentId);
  const nextOrder =
    existing.length > 0 ? Math.max(...existing.map((r) => r.sort_order)) + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from("susi_class2_checklist_items")
    .insert({
      student_id: studentId,
      application_id: applicationId,
      label,
      sort_order: nextOrder,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChecklistItem;
}

export async function toggleChecklistItem(id: string, isSubmitted: boolean) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_checklist_items")
    .update({ is_submitted: isSubmitted, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ChecklistItem;
}

export async function updateChecklistNote(id: string, note: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("susi_class2_checklist_items")
    .update({ note, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ChecklistItem;
}

export async function deleteChecklistItem(id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("susi_class2_checklist_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
