"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { listApplications, listStudents } from "@/lib/data";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";
import { parseInterestPdf, ParsedInterestRow } from "@/lib/interest-pdf";
import {
  ImportResult,
  ImportSelection,
  InterestPreview,
  InterestPreviewRow,
} from "@/lib/interest-import-types";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

// 이 대량 입력 기능은 금융과 전용이다. 다른 학급 세션으로는 절대 접근할 수 없다.
async function requireFinanceTeacher() {
  const session = await readVerifiedTeacherClassSession();
  if (!session || session.classCode !== "finance") {
    throw new Error("금융과 담임 인증이 필요합니다.");
  }
}

function normalize(value: string) {
  return value.replace(/\s+/g, "").trim().toLocaleLowerCase("ko-KR");
}

function parseSchoolNumber(value: string | null) {
  if (!value) return null;
  const labeled = value.match(/(\d+)\s*학년\D*(\d+)\s*반\D*(\d+)\s*번/);
  if (labeled) return { grade: labeled[1], classNumber: labeled[2], number: String(+labeled[3]) };
  const digits = value.replace(/\D/g, "");
  if (digits.length === 4) {
    return { grade: digits[0], classNumber: digits[1], number: String(+digits.slice(2)) };
  }
  if (digits.length === 3) {
    return { grade: digits[0], classNumber: digits[1], number: String(+digits[2]) };
  }
  return null;
}

function duplicateKey(row: ParsedInterestRow) {
  return [
    row.region,
    row.universityName,
    row.department,
    row.admissionType,
    row.admissionName,
  ].map(normalize).join("|");
}

function applicationKey(row: Record<string, unknown>) {
  return [
    row.region,
    row.university_name,
    row.department,
    row.admission_type,
    row.admission_name,
  ].map((value) => normalize(String(value ?? ""))).join("|");
}

function pdfPatch(row: ParsedInterestRow, batchId?: string) {
  return {
    region: row.region,
    university_name: row.universityName,
    department: row.department,
    major_series: row.majorSeries,
    admission_type: row.admissionType,
    admission_name: row.admissionName,
    admission_method: row.selectionType,
    stage1_elements: row.stage1Elements,
    season: row.season,
    selection_type: row.selectionType,
    csat_min_grade: row.csatMinimum,
    recruit_count: row.recruitCount,
    my_grade: row.myGrade,
    my_score: row.myScore,
    data_source: "pdf",
    ...(batchId ? { import_batch_id: batchId } : {}),
    updated_at: new Date().toISOString(),
  };
}

const COMPARE_FIELDS = [
  ["지역", "region", "region"],
  ["지원대학", "university_name", "universityName"],
  ["모집단위", "department", "department"],
  ["전형유형", "admission_type", "admissionType"],
  ["세부유형", "admission_name", "admissionName"],
  ["나의 내신", "my_grade", "myGrade"],
  ["모집인원", "recruit_count", "recruitCount"],
] as const;

export async function analyzeInterestPdfAction(formData: FormData): Promise<InterestPreview> {
  await requireFinanceTeacher();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("PDF 파일을 선택해 주세요.");
  if (!file.name.toLowerCase().endsWith(".pdf") || file.type !== "application/pdf") {
    throw new Error("PDF 파일만 업로드할 수 있습니다.");
  }
  if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
    throw new Error("PDF 파일은 0바이트보다 크고 10MB 이하여야 합니다.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder("ascii").decode(bytes.slice(0, 5)) !== "%PDF-") {
    throw new Error("올바른 PDF 파일이 아닙니다.");
  }

  const [parsedRows, students] = await Promise.all([parseInterestPdf(bytes), listStudents("finance")]);
  const applicationEntries = await Promise.all(
    students.map(async (student) => [student.id, await listApplications(student.id)] as const)
  );
  const applications = new Map(applicationEntries);

  const rows: InterestPreviewRow[] = parsedRows.map((row) => {
    const identityMatches = students.filter((student) => {
      const number = parseSchoolNumber(student.student_number);
      return number && number.grade === row.grade && number.classNumber === row.classNumber &&
        number.number === String(+row.studentNumber);
    });
    const exact = identityMatches.find((student) => normalize(student.name) === normalize(row.studentName));
    const matched = exact ?? (identityMatches.length === 1 ? identityMatches[0] : null);
    const matchStatus = exact ? "exact" : identityMatches.length ? "review" : "unmatched";
    const existing = matched
      ? applications.get(matched.id)?.find((app) => applicationKey(app) === duplicateKey(row))
      : undefined;
    const comparison = existing
      ? COMPARE_FIELDS.flatMap(([field, appKey, pdfKey]) => {
          const oldValue = String(existing[appKey] ?? "");
          const newValue = String(row[pdfKey] ?? "");
          return normalize(oldValue) === normalize(newValue)
            ? []
            : [{ field, existing: oldValue, pdf: newValue }];
        })
      : [];
    return {
      ...row,
      matchStatus,
      matchedStudentId: matched?.id ?? null,
      matchedStudentName: matched?.name ?? null,
      existingApplicationId: existing?.id ?? null,
      decision: !exact ? "skip" : existing ? (comparison.length ? "skip" : "skip") : "add",
      comparison,
    };
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    rows,
    students: students.map((s) => ({ id: s.id, name: s.name, studentNumber: s.student_number })),
    summary: {
      total: rows.length,
      exact: rows.filter((r) => r.matchStatus === "exact").length,
      review: rows.filter((r) => r.matchStatus === "review").length,
      unmatched: rows.filter((r) => r.matchStatus === "unmatched").length,
      additions: rows.filter((r) => r.decision === "add").length,
      duplicates: rows.filter((r) => r.existingApplicationId && r.comparison.length === 0).length,
      updates: rows.filter((r) => r.existingApplicationId && r.comparison.length > 0).length,
    },
  };
}

export async function applyInterestImportAction(
  fileName: string,
  selections: ImportSelection[]
): Promise<ImportResult> {
  await requireFinanceTeacher();
  const supabaseAdmin = getSupabaseAdmin();
  const result: ImportResult = { inserted: 0, updated: 0, skipped: 0, failed: 0, failures: [] };
  const { data: batch, error: batchError } = await supabaseAdmin
    .from("susi_class2_import_batches")
    .insert({ original_file_name: fileName.slice(0, 255), total_rows: selections.length })
    .select("id")
    .single();
  if (batchError || !batch) throw new Error("가져오기 이력을 만들지 못했습니다. Migration 적용 여부를 확인해 주세요.");

  for (const item of selections) {
    if (item.decision === "skip" || !item.targetStudentId) {
      result.skipped += 1;
      continue;
    }
    try {
      // class_code='finance' 조건으로 다른 학급 학생에게 잘못 기록되는 것을 막는다.
      const { data: student } = await supabaseAdmin
        .from("susi_class2_students")
        .select("id")
        .eq("id", item.targetStudentId)
        .eq("class_code", "finance")
        .maybeSingle();
      if (!student) throw new Error("대상 학생을 확인할 수 없습니다.");
      const existingRows = await listApplications(student.id);
      const duplicate = existingRows.find((app) => applicationKey(app) === duplicateKey(item.row));

      if (item.decision === "add") {
        if (duplicate) { result.skipped += 1; continue; }
        const nextSeq = existingRows.length ? Math.max(...existingRows.map((r) => r.seq)) + 1 : 1;
        const { error } = await supabaseAdmin.from("susi_class2_applications").insert({
          student_id: student.id, seq: nextSeq, ...pdfPatch(item.row, batch.id),
        });
        if (error) throw new Error("지원대학 행을 추가하지 못했습니다.");
        result.inserted += 1;
      } else {
        const target = existingRows.find((app) => app.id === item.existingApplicationId);
        if (!target) throw new Error("갱신할 기존 행을 찾을 수 없습니다.");
        const { error } = await supabaseAdmin.from("susi_class2_applications")
          .update(pdfPatch(item.row, batch.id)).eq("id", target.id).eq("student_id", student.id);
        if (error) throw new Error("지원대학 행을 갱신하지 못했습니다.");
        result.updated += 1;
      }
    } catch (error) {
      result.failed += 1;
      if (result.failures.length < 10) {
        result.failures.push(`${item.row.studentName} / ${item.row.universityName}: ${error instanceof Error ? error.message : "처리 실패"}`);
      }
    }
  }

  await supabaseAdmin.from("susi_class2_import_batches").update({
    inserted_rows: result.inserted,
    updated_rows: result.updated,
    skipped_rows: result.skipped,
    failed_rows: result.failed,
  }).eq("id", batch.id);
  return result;
}
