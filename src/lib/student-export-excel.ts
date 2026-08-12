import "server-only";

import ExcelJS from "exceljs";
import { CLASS_UI_NAME_BY_CODE } from "@/lib/class-codes";
import {
  EXPORT_DOCUMENT_TITLE,
  EXPORT_SCHOOL_NAME,
  EXPORT_SCHOOL_YEAR,
  formatGeneratedDate,
  getFilledApplications,
  type StudentExportData,
} from "@/lib/student-export-shared";

const HEADER_FILL = "DCE6F1";
const BORDER_COLOR = "CBD5E1";

function toExcelDate(value: string | null) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : value;
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FF1E293B" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${HEADER_FILL}` } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  row.height = 28;
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: `FF${BORDER_COLOR}` } },
      left: { style: "thin", color: { argb: `FF${BORDER_COLOR}` } },
      bottom: { style: "thin", color: { argb: `FF${BORDER_COLOR}` } },
      right: { style: "thin", color: { argb: `FF${BORDER_COLOR}` } },
    };
  });
}

function styleBody(worksheet: ExcelJS.Worksheet, startRow: number, endRow: number) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: `FF${BORDER_COLOR}` } },
      };
    });
  }
}

export async function createStudentExportWorkbook(data: StudentExportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "영동미래고";
  workbook.created = new Date();
  workbook.modified = new Date();

  const className = CLASS_UI_NAME_BY_CODE[data.student.class_code];
  const generatedDate = formatGeneratedDate();
  const applications = getFilledApplications(data.applications);

  const infoSheet = workbook.addWorksheet("학생정보", {
    views: [{ showGridLines: false }],
  });
  infoSheet.columns = [{ width: 18 }, { width: 42 }];
  infoSheet.mergeCells("A1:B1");
  infoSheet.getCell("A1").value = EXPORT_DOCUMENT_TITLE;
  infoSheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1E3A5F" } };
  infoSheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  infoSheet.getRow(1).height = 32;
  infoSheet.addRow([]);
  infoSheet.addRows([
    ["항목", "내용"],
    ["학년도", EXPORT_SCHOOL_YEAR],
    ["학교명", EXPORT_SCHOOL_NAME],
    ["학급", className],
    ["학번", data.student.student_number ?? "-"],
    ["이름", data.student.name],
    ["생성일", generatedDate],
  ]);
  styleHeader(infoSheet.getRow(3));
  styleBody(infoSheet, 4, 9);

  const applicationSheet = workbook.addWorksheet("지원대학", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
  });
  applicationSheet.columns = [
    { header: "순번", key: "seq", width: 8 },
    { header: "지역", key: "region", width: 12 },
    { header: "대학명", key: "university", width: 22 },
    { header: "학과", key: "department", width: 24 },
    { header: "전형유형", key: "admissionType", width: 15 },
    { header: "전형명", key: "admissionName", width: 20 },
    { header: "전형방법", key: "admissionMethod", width: 22 },
    { header: "수능 최저등급", key: "csat", width: 16 },
    { header: "모집인원", key: "recruit", width: 12 },
    { header: "전년모집", key: "previousRecruit", width: 12 },
    { header: "제출서류", key: "documents", width: 24 },
    { header: "원서접수일", key: "applyDate", width: 15 },
    { header: "서류제출일", key: "documentDate", width: 15 },
    { header: "1단계발표일", key: "stageDate", width: 15 },
    { header: "면접일", key: "interviewDate", width: 15 },
    { header: "최종발표일", key: "finalDate", width: 15 },
    { header: "나의 내신", key: "grade", width: 12 },
    { header: "전년평균", key: "previousGrade", width: 12 },
    { header: "비고", key: "note", width: 28 },
    { header: "전년합격컷", key: "firstPassCut", width: 14 },
    { header: "70%컷", key: "cut70", width: 12 },
    { header: "최종컷", key: "additionalPassCut", width: 12 },
    { header: "추가 비고", key: "remarks", width: 28 },
  ];
  styleHeader(applicationSheet.getRow(1));

  if (applications.length === 0) {
    applicationSheet.addRow(["등록된 지원대학이 없습니다."]);
    applicationSheet.mergeCells("A2:S2");
  } else {
    for (const application of applications) {
      applicationSheet.addRow({
        seq: application.seq,
        region: application.region || "-",
        university: application.university_name,
        department: application.department || "-",
        admissionType: application.admission_type || "-",
        admissionName: application.admission_name || "-",
        admissionMethod: application.admission_method || "-",
        csat: application.csat_min_grade || "-",
        recruit: application.recruit_count || "-",
        previousRecruit: application.prev_recruit_count || "-",
        documents: application.required_documents || "-",
        applyDate: toExcelDate(application.apply_start_date),
        documentDate: toExcelDate(application.document_submit_date),
        stageDate: toExcelDate(application.stage1_announce_date),
        interviewDate: toExcelDate(application.interview_date),
        finalDate: toExcelDate(application.final_announce_date),
        grade: application.my_grade || "-",
        previousGrade: application.prev_avg_grade || "-",
        note: application.note || "-",
        firstPassCut: application.first_pass_cut || "-",
        cut70: application.cut_70 || "-",
        additionalPassCut: application.additional_pass_cut || "-",
        remarks: application.remarks || "-",
      });
    }
  }
  for (const column of ["L", "M", "N", "O", "P"]) {
    applicationSheet.getColumn(column).numFmt = "yyyy-mm-dd";
  }
  styleBody(applicationSheet, 2, applicationSheet.rowCount);
  applicationSheet.autoFilter = { from: "A1", to: "W1" };

  const checklistSheet = workbook.addWorksheet("제출서류", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
  });
  checklistSheet.columns = [
    { header: "대학명", key: "university", width: 24 },
    { header: "제출서류명", key: "label", width: 30 },
    { header: "완료 여부", key: "status", width: 14 },
    { header: "서류 마감일", key: "deadline", width: 16 },
    { header: "비고", key: "note", width: 32 },
  ];
  styleHeader(checklistSheet.getRow(1));

  if (applications.length === 0) {
    checklistSheet.addRow(["등록된 지원대학이 없습니다."]);
    checklistSheet.mergeCells("A2:E2");
  } else {
    for (const application of applications) {
      const items = data.checklistItems.filter(
        (item) => item.application_id === application.id
      );
      if (items.length === 0) {
        checklistSheet.addRow({
          university: application.university_name,
          label: "등록된 제출서류가 없습니다.",
          status: "-",
          deadline: toExcelDate(application.document_submit_date),
          note: "-",
        });
        continue;
      }
      for (const item of items) {
        checklistSheet.addRow({
          university: application.university_name,
          label: item.label,
          status: item.is_submitted ? "완료" : "미완료",
          deadline: toExcelDate(application.document_submit_date),
          note: item.note || "-",
        });
      }
    }
  }
  checklistSheet.getColumn("D").numFmt = "yyyy-mm-dd";
  styleBody(checklistSheet, 2, checklistSheet.rowCount);
  checklistSheet.autoFilter = { from: "A1", to: "E1" };

  for (const worksheet of workbook.worksheets) {
    worksheet.eachRow((row) => {
      row.alignment = { ...row.alignment, vertical: "top", wrapText: true };
    });
    worksheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    };
  }

  return workbook;
}
