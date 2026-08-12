import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { CLASS_UI_NAME_BY_CODE, isClassCode } from "@/lib/class-codes";
import { listStudents } from "@/lib/data";
import { buildStudentUrl } from "@/lib/student-link-url";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rawClass = request.nextUrl.searchParams.get("class") ?? "";
  if (!isClassCode(rawClass)) return NextResponse.json({ error: "올바른 학급이 아닙니다." }, { status: 400 });
  const session = await readVerifiedTeacherClassSession();
  if (!session || session.classCode !== rawClass) return NextResponse.json({ error: "이 학급의 링크를 내보낼 권한이 없습니다." }, { status: 403 });
  const students = await listStudents(rawClass);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "영동미래고등학교 수시자료 취합 시스템";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("학생 링크", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    { header: "순번", key: "seq", width: 8 }, { header: "학급", key: "className", width: 14 },
    { header: "학번", key: "studentNumber", width: 16 }, { header: "이름", key: "name", width: 16 },
    { header: "학생 접속 URL", key: "url", width: 52 }, { header: "상태", key: "status", width: 14 },
  ];
  students.forEach((student, index) => {
    const url = student.access_code ? buildStudentUrl(student.access_code) : "";
    const row = sheet.addRow({ seq: index + 1, className: CLASS_UI_NAME_BY_CODE[rawClass], studentNumber: student.student_number ?? "", name: student.name, url, status: url ? "사용 가능" : "코드 없음" });
    if (url) row.getCell("url").value = { text: url, hyperlink: url };
  });
  const header = sheet.getRow(1); header.font = { bold: true, color: { argb: "FFFFFFFF" } }; header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF123B6D" } }; header.alignment = { vertical: "middle", horizontal: "center" }; header.height = 24;
  sheet.autoFilter = { from: "A1", to: "F1" };
  sheet.eachRow((row, rowNumber) => { row.alignment = { vertical: "middle", wrapText: rowNumber > 1 }; row.height = rowNumber === 1 ? 24 : 22; });
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `2026_${CLASS_UI_NAME_BY_CODE[rawClass]}_학생접속링크.xlsx`;
  return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="student-links.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`, "Cache-Control": "private, no-store" } });
}
