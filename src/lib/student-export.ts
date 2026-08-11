import "server-only";

import { notFound, redirect } from "next/navigation";
import { getStudentById, listApplications, listChecklist } from "@/lib/data";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";
import type { StudentExportData } from "@/lib/student-export-shared";

export async function getAuthorizedStudentExportData(
  studentId: string
): Promise<StudentExportData> {
  const session = await readVerifiedTeacherClassSession();
  if (!session) {
    redirect("/teacher?auth=required");
  }

  const student = await getStudentById(studentId);
  if (!student) {
    notFound();
  }

  if (session.classCode !== student.class_code) {
    redirect("/teacher?auth=required");
  }

  const [applications, checklistItems] = await Promise.all([
    listApplications(student.id),
    listChecklist(student.id),
  ]);

  return { student, applications, checklistItems };
}
