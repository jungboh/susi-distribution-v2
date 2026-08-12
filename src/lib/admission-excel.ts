import "server-only";
import { createHash } from "crypto";
import readXlsxFile from "read-excel-file/node";

type CellValue = string | number | boolean | Date | null;

export type ParsedAdmissionExcelRow = {
  rowKey: string;
  sourceRow: number;
  grade: string;
  classNumber: string;
  studentNumber: string;
  studentName: string;
  region: string;
  majorSeries: string;
  universityName: string;
  department: string;
  season: string;
  admissionType: string;
  admissionName: string;
  selectionType: string;
  admissionMethod: string;
  csatMinGrade: string;
  recruitCount: string;
  myGrade: string;
  myScore: string;
  applyStartDate: string;
  documentSubmitDate: string;
  stage1AnnounceDate: string;
  interviewDate: string;
  finalAnnounceDate: string;
  requiredDocuments: string;
  noteCandidate: string;
  cut70Candidate: string;
  firstPassCandidate: string;
  warnings: string[];
};

const REQUIRED_HEADERS = [
  "학년", "반", "번호", "이름", "지역", "지원대학", "모집단위",
  "시기", "전형유형", "전형명",
] as const;

function text(value: CellValue | undefined) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function firstIsoDate(value: CellValue | undefined) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return text(value).match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
}

function makeRowKey(row: Omit<ParsedAdmissionExcelRow, "rowKey">) {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex").slice(0, 20);
}

export async function parseAdmissionExcel(buffer: Buffer) {
  const rows = (await readXlsxFile(buffer, { sheet: "관심대학_입결통합" })) as CellValue[][];
  const headerIndex = rows.slice(0, 20).findIndex((row) => {
    const headers = new Set(row.map((cell) => text(cell)));
    return REQUIRED_HEADERS.every((header) => headers.has(header));
  });
  if (headerIndex < 0) throw new Error("필수 헤더 행을 찾을 수 없습니다.");

  const headerMap = new Map<string, number>();
  rows[headerIndex].forEach((cell, index) => {
    const name = text(cell);
    if (name && !headerMap.has(name)) headerMap.set(name, index);
  });
  const missing = REQUIRED_HEADERS.filter((header) => !headerMap.has(header));
  if (missing.length) throw new Error(`필수 헤더가 없습니다: ${missing.join(", ")}`);
  const get = (row: CellValue[], header: string) => row[headerMap.get(header) ?? -1];

  const parsed: ParsedAdmissionExcelRow[] = [];
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const studentName = text(get(row, "이름"));
    const universityName = text(get(row, "지원대학"));
    if (!studentName && !universityName) return;
    if (!studentName || !universityName) {
      throw new Error(`${headerIndex + offset + 2}행의 학생 이름 또는 지원대학이 비어 있습니다.`);
    }
    const cut70Candidate = text(get(row, "70%컷/최저"));
    const firstPassCandidate = text(get(row, "합격자 평균(등급)"));
    const warnings: string[] = [];
    if (cut70Candidate) warnings.push("70%컷/최저는 의미 확인 전 자동 반영하지 않음");
    if (firstPassCandidate) warnings.push("합격자 평균은 최초합컷으로 자동 변환하지 않음");
    const base: Omit<ParsedAdmissionExcelRow, "rowKey"> = {
      sourceRow: headerIndex + offset + 2,
      grade: text(get(row, "학년")),
      classNumber: text(get(row, "반")),
      studentNumber: text(get(row, "번호")),
      studentName,
      region: text(get(row, "지역")),
      majorSeries: text(get(row, "계열")),
      universityName,
      department: text(get(row, "모집단위")),
      season: text(get(row, "시기")),
      admissionType: text(get(row, "전형유형")),
      admissionName: text(get(row, "전형명")),
      selectionType: text(get(row, "선발유형")),
      admissionMethod: text(get(row, "2027 전형방법")),
      csatMinGrade: text(get(row, "2027 수능최저등급")),
      recruitCount: text(get(row, "2027 모집인원")),
      myGrade: text(get(row, "내등급")),
      myScore: text(get(row, "내점수")),
      applyStartDate: firstIsoDate(get(row, "원서접수일")),
      documentSubmitDate: firstIsoDate(get(row, "서류제출일")),
      stage1AnnounceDate: firstIsoDate(get(row, "1단계발표일")),
      interviewDate: firstIsoDate(get(row, "전형일(면접)")),
      finalAnnounceDate: firstIsoDate(get(row, "최종발표일")),
      requiredDocuments: text(get(row, "제출서류")),
      noteCandidate: text(get(row, "입결 비고")),
      cut70Candidate,
      firstPassCandidate,
      warnings,
    };
    parsed.push({ ...base, rowKey: makeRowKey(base) });
  });

  if (!parsed.length) throw new Error("가져올 지원대학 행이 없습니다.");
  return parsed;
}
