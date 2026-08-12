"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { listApplications, listStudents } from "@/lib/data";
import { Application } from "@/lib/types";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";
import { parseAdmissionExcel, ParsedAdmissionExcelRow } from "@/lib/admission-excel";
import {
  AdmissionExcelPreview,
  AdmissionExcelPreviewRow,
  ExcelImportDecision,
} from "@/lib/admission-excel-import-types";
import { ImportResult } from "@/lib/interest-import-types";

const MAX_EXCEL_BYTES = 10 * 1024 * 1024;

// 이 대량 입력 기능은 금융과 전용이다. 다른 학급 세션으로는 절대 접근할 수 없다.
async function requireFinanceTeacher() {
  const session = await readVerifiedTeacherClassSession();
  if (!session || session.classCode !== "finance") {
    throw new Error("금융과 담임 인증이 필요합니다.");
  }
}

function normalize(value: unknown) {
  return String(value ?? "").replace(/[\s　]+/g, "").trim().toLocaleLowerCase("ko-KR");
}

function parseSchoolNumber(value: string | null) {
  if (!value) return null;
  const labeled = value.match(/(\d+)\s*학년\D*(\d+)\s*반\D*(\d+)\s*번/);
  if (labeled) return { grade: labeled[1], classNumber: labeled[2], number: String(+labeled[3]) };
  const digits = value.replace(/\D/g, "");
  if (digits.length === 4) return { grade: digits[0], classNumber: digits[1], number: String(+digits.slice(2)) };
  if (digits.length === 3) return { grade: digits[0], classNumber: digits[1], number: String(+digits[2]) };
  return null;
}

function rowKey(row: ParsedAdmissionExcelRow) {
  return [row.region, row.universityName, row.department, row.season, row.admissionType, row.admissionName]
    .map(normalize).join("|");
}

function applicationKey(row: Application) {
  return [row.region, row.university_name, row.department, row.season, row.admission_type, row.admission_name]
    .map(normalize).join("|");
}

const FIELD_MAP = [
  ["지역", "region", "region"], ["계열", "major_series", "majorSeries"],
  ["지원대학", "university_name", "universityName"], ["모집단위", "department", "department"],
  ["시기", "season", "season"], ["전형유형", "admission_type", "admissionType"],
  ["전형명", "admission_name", "admissionName"], ["선발유형", "selection_type", "selectionType"],
  ["전형방법", "admission_method", "admissionMethod"], ["수능최저", "csat_min_grade", "csatMinGrade"],
  ["모집인원", "recruit_count", "recruitCount"], ["나의 내신", "my_grade", "myGrade"],
  ["내점수", "my_score", "myScore"], ["원서접수일", "apply_start_date", "applyStartDate"],
  ["서류제출일", "document_submit_date", "documentSubmitDate"],
  ["1단계발표일", "stage1_announce_date", "stage1AnnounceDate"],
  ["면접일", "interview_date", "interviewDate"], ["최종발표일", "final_announce_date", "finalAnnounceDate"],
  ["제출서류", "required_documents", "requiredDocuments"],
] as const;

function mappedValues(row: ParsedAdmissionExcelRow) {
  const values: Record<string, string> = {};
  for (const [, appKey, excelKey] of FIELD_MAP) {
    const value = row[excelKey];
    if (value) values[appKey] = value;
  }
  return values;
}

function noteFromExcel(value: string) {
  return value ? `[Excel 입결 비고] ${value}` : "";
}

function compare(existing: Application, row: ParsedAdmissionExcelRow) {
  const fillCandidates: AdmissionExcelPreviewRow["fillCandidates"] = [];
  const conflicts: AdmissionExcelPreviewRow["conflicts"] = [];
  for (const [field, appKey, excelKey] of FIELD_MAP) {
    const oldValue = String(existing[appKey] ?? "");
    const newValue = row[excelKey];
    if (!newValue || normalize(oldValue) === normalize(newValue)) continue;
    (oldValue.trim() ? conflicts : fillCandidates).push({ field, existing: oldValue, excel: newValue });
  }
  if (row.noteCandidate) {
    const oldNote = existing.note ?? "";
    const newNote = noteFromExcel(row.noteCandidate);
    if (!oldNote.trim()) fillCandidates.push({ field: "입결 비고", existing: "", excel: newNote });
    else if (!oldNote.includes(newNote)) conflicts.push({ field: "입결 비고(추가 후보)", existing: oldNote, excel: newNote });
  }
  return { fillCandidates, conflicts };
}

async function validatedFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Excel 파일을 선택해 주세요.");
  if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error(".xlsx 파일만 업로드할 수 있습니다.");
  if (file.size <= 0 || file.size > MAX_EXCEL_BYTES) throw new Error("Excel 파일은 0바이트보다 크고 10MB 이하여야 합니다.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error("손상되었거나 올바르지 않은 .xlsx 파일입니다.");
  return { file, rows: await parseAdmissionExcel(bytes) };
}

export async function analyzeAdmissionExcelAction(formData: FormData): Promise<AdmissionExcelPreview> {
  await requireFinanceTeacher();
  const [{ file, rows: parsedRows }, students] = await Promise.all([
    validatedFile(formData),
    listStudents("finance"),
  ]);
  const applicationEntries = await Promise.all(students.map(async (student) => [student.id, await listApplications(student.id)] as const));
  const applications = new Map(applicationEntries);

  const rows: AdmissionExcelPreviewRow[] = parsedRows.map((row) => {
    const identityMatches = students.filter((student) => {
      const number = parseSchoolNumber(student.student_number);
      return number && number.grade === row.grade && number.classNumber === row.classNumber && number.number === String(+row.studentNumber);
    });
    const exact = identityMatches.find((student) => normalize(student.name) === normalize(row.studentName));
    const matched = exact ?? (identityMatches.length === 1 ? identityMatches[0] : null);
    const matchStatus = exact ? "exact" : identityMatches.length ? "review" : "unmatched";
    const existing = matched ? applications.get(matched.id)?.find((app) => applicationKey(app) === rowKey(row)) : undefined;
    const differences = existing ? compare(existing, row) : { fillCandidates: [], conflicts: [] };
    const decision: ExcelImportDecision = !exact ? "skip" : !existing ? "add" :
      differences.conflicts.length ? "skip" : differences.fillCandidates.length ? "fill" : "duplicate";
    return {
      ...row, matchStatus, matchedStudentId: matched?.id ?? null,
      matchedStudentName: matched?.name ?? null, existingApplicationId: existing?.id ?? null,
      decision, ...differences,
    };
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    rows,
    students: students.map((s) => ({ id: s.id, name: s.name, studentNumber: s.student_number })),
    summary: {
      total: rows.length,
      studentCount: new Set(rows.map((r) => `${r.grade}|${r.classNumber}|${r.studentNumber}|${normalize(r.studentName)}`)).size,
      exact: rows.filter((r) => r.matchStatus === "exact").length,
      review: rows.filter((r) => r.matchStatus === "review").length,
      unmatched: rows.filter((r) => r.matchStatus === "unmatched").length,
      additions: rows.filter((r) => r.decision === "add").length,
      duplicates: rows.filter((r) => r.decision === "duplicate").length,
      fills: rows.filter((r) => r.decision === "fill").length,
      updates: rows.filter((r) => r.existingApplicationId && r.conflicts.length).length,
    },
  };
}

type Selection = { rowKey: string; decision: ExcelImportDecision; targetStudentId: string | null; existingApplicationId: string | null };

export async function applyAdmissionExcelAction(formData: FormData): Promise<ImportResult> {
  await requireFinanceTeacher();
  const supabaseAdmin = getSupabaseAdmin();
  const { file, rows } = await validatedFile(formData);
  let selections: Selection[];
  try { selections = JSON.parse(String(formData.get("selections") ?? "[]")); }
  catch { throw new Error("반영 선택값을 확인할 수 없습니다."); }
  const selectionMap = new Map(selections.map((selection) => [selection.rowKey, selection]));
  const result: ImportResult = { inserted: 0, updated: 0, skipped: 0, failed: 0, failures: [] };
  const { data: batch, error: batchError } = await supabaseAdmin.from("susi_class2_import_batches")
    .insert({ original_file_name: file.name.slice(0, 255), total_rows: rows.length }).select("id").single();
  if (batchError || !batch) throw new Error("가져오기 이력을 만들지 못했습니다. Migration 적용 여부를 확인해 주세요.");

  for (const row of rows.sort((a, b) => a.sourceRow - b.sourceRow)) {
    const selection = selectionMap.get(row.rowKey);
    if (!selection || ["skip", "duplicate"].includes(selection.decision) || !selection.targetStudentId) { result.skipped += 1; continue; }
    try {
      // class_code='finance' 조건으로 다른 학급 학생에게 잘못 기록되는 것을 막는다.
      const { data: student } = await supabaseAdmin
        .from("susi_class2_students")
        .select("id")
        .eq("id", selection.targetStudentId)
        .eq("class_code", "finance")
        .maybeSingle();
      if (!student) throw new Error("대상 학생을 확인할 수 없습니다.");
      const currentRows = await listApplications(student.id);
      const duplicate = currentRows.find((app) => applicationKey(app) === rowKey(row));
      if (selection.decision === "add") {
        if (duplicate) { result.skipped += 1; continue; }
        const nextSeq = currentRows.length ? Math.max(...currentRows.map((app) => app.seq)) + 1 : 1;
        const { error } = await supabaseAdmin.from("susi_class2_applications").insert({
          student_id: student.id, seq: nextSeq, ...mappedValues(row),
          note: noteFromExcel(row.noteCandidate), data_source: "excel", import_batch_id: batch.id,
        });
        if (error) throw new Error("지원대학 행을 추가하지 못했습니다.");
        result.inserted += 1;
        continue;
      }
      const target = duplicate ?? currentRows.find((app) => app.id === selection.existingApplicationId);
      if (!target) throw new Error("보완할 기존 행을 찾을 수 없습니다.");
      const incoming = mappedValues(row);
      const patch: Record<string, string> = {};
      for (const [key, value] of Object.entries(incoming)) {
        if (selection.decision === "update" || !String(target[key as keyof Application] ?? "").trim()) patch[key] = value;
      }
      const excelNote = noteFromExcel(row.noteCandidate);
      if (excelNote && !target.note.includes(excelNote)) {
        if (selection.decision === "update" || !target.note.trim()) patch.note = target.note.trim() ? `${target.note}\n${excelNote}` : excelNote;
      }
      const { error } = await supabaseAdmin.from("susi_class2_applications").update({
        ...patch, data_source: "excel", import_batch_id: batch.id, updated_at: new Date().toISOString(),
      }).eq("id", target.id).eq("student_id", student.id);
      if (error) throw new Error("지원대학 행을 보완하지 못했습니다.");
      result.updated += 1;
    } catch (error) {
      result.failed += 1;
      if (result.failures.length < 10) result.failures.push(`${row.studentName} / ${row.universityName}: ${error instanceof Error ? error.message : "처리 실패"}`);
    }
  }
  await supabaseAdmin.from("susi_class2_import_batches").update({ inserted_rows: result.inserted, updated_rows: result.updated, skipped_rows: result.skipped, failed_rows: result.failed }).eq("id", batch.id);
  return result;
}
