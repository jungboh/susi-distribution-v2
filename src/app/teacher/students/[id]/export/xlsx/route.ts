import { NextResponse } from "next/server";
import { CLASS_NAME_BY_CODE } from "@/lib/class-codes";
import { logServerError } from "@/lib/server-debug";
import {
  getAuthorizedStudentExportData,
} from "@/lib/student-export";
import { sanitizeFilenamePart } from "@/lib/student-export-shared";
import { createStudentExportWorkbook } from "@/lib/student-export-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getAuthorizedStudentExportData(id);

  try {
    const workbook = await createStudentExportWorkbook(data);
    const buffer = await workbook.xlsx.writeBuffer();
    const className = sanitizeFilenamePart(CLASS_NAME_BY_CODE[data.student.class_code]);
    const studentNumber = sanitizeFilenamePart(data.student.student_number ?? "번호없음");
    const studentName = sanitizeFilenamePart(data.student.name);
    const filename = `2026_수시지원서류_${className}_${studentNumber}_${studentName}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="student-export.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    logServerError("student-export.xlsx", error);
    return NextResponse.json(
      { error: "파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
