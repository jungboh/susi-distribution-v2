import "server-only";
import readXlsxFile, { readSheetNames } from "read-excel-file/node";

type CellValue = string | number | boolean | Date | null;

export type StudentRosterRow = {
  sourceRow: number;
  name: string;
  studentNumber: string;
};

function cellText(value: CellValue | undefined) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export async function parseStudentRosterExcel(buffer: Buffer) {
  const sheets = await readSheetNames(buffer);
  if (!sheets.length) throw new Error("Excel 시트를 찾을 수 없습니다.");

  const rows = (await readXlsxFile(buffer, { sheet: sheets[0] })) as CellValue[][];
  const headerIndex = rows.slice(0, 20).findIndex((row) =>
    row.some((cell) => cellText(cell) === "이름")
  );
  if (headerIndex < 0) throw new Error("첫 20행 안에서 '이름' 열을 찾을 수 없습니다.");

  const headers = rows[headerIndex].map(cellText);
  const nameIndex = headers.indexOf("이름");
  const studentNumberIndex = headers.findIndex((header) =>
    ["학번", "번호"].includes(header)
  );

  const parsed: StudentRosterRow[] = [];
  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const name = cellText(row[nameIndex]);
    const studentNumber = studentNumberIndex >= 0 ? cellText(row[studentNumberIndex]) : "";
    if (!name && !studentNumber) return;
    if (!name) throw new Error(`${headerIndex + offset + 2}행의 이름이 비어 있습니다.`);
    parsed.push({ sourceRow: headerIndex + offset + 2, name, studentNumber });
  });

  if (!parsed.length) throw new Error("등록할 학생이 없습니다.");
  if (parsed.length > 100) throw new Error("한 번에 최대 100명까지 등록할 수 있습니다.");
  return parsed;
}
