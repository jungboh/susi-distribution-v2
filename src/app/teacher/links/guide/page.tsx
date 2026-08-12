import { redirect } from "next/navigation";
import { LinkGuideActions } from "@/components/teacher/link-guide-actions";
import { CLASS_UI_NAME_BY_CODE, isClassCode, type ClassCode } from "@/lib/class-codes";
import { getStudentById, listStudents } from "@/lib/data";
import { buildStudentUrl } from "@/lib/student-link-url";
import { readVerifiedTeacherClassSession } from "@/lib/teacher-auth";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LinkGuidePage({ searchParams }: { searchParams: Promise<{ class?: string; student?: string }> }) {
  const params = await searchParams;
  if (!params.class || !isClassCode(params.class)) redirect("/");
  const classCode: ClassCode = params.class;
  const session = await readVerifiedTeacherClassSession();
  if (!session || session.classCode !== classCode) redirect(`/teacher?class=${classCode}&view=links`);

  let students: Student[];
  if (params.student) {
    const student = await getStudentById(params.student);
    if (!student || student.class_code !== classCode) redirect(`/teacher?class=${classCode}&view=links`);
    students = [student];
  } else {
    students = await listStudents(classCode);
  }

  const guides = students
    .filter((student) => student.access_code)
    .map((student) => ({ student, url: buildStudentUrl(student.access_code) }));

  return <main className="link-guide-screen bg-slate-100 py-4 sm:py-8"><LinkGuideActions />{guides.length === 0 ? <GuideError message="출력할 수 있는 학생 링크가 없습니다." /> : <div className="link-guide-stack">{guides.map(({ student, url }) => <article key={student.id} className="link-guide-page">
    <header className="link-guide-header"><p>영동미래고등학교</p><h1>학생·학부모 수시자료 입력 안내</h1><p>2026학년도 · {CLASS_UI_NAME_BY_CODE[classCode]}</p></header>
    <section className="link-guide-student" aria-label="학생 정보"><div><span>학번</span><strong>{student.student_number || "-"}</strong></div><div><span>학생명</span><strong>{student.name}</strong></div></section>
    <section className="link-guide-instructions" aria-label="접속 방법"><h2>접속 방법</h2><ol><li>아래 학생 전용 접속 주소를 브라우저 주소창에 입력하거나 복사해 엽니다.</li><li>지원대학 정보를 입력한 뒤 다른 칸을 선택해 저장 상태를 확인합니다.</li><li>대학별 제출서류 체크리스트도 함께 확인합니다.</li></ol></section>
    <section className="link-guide-url"><h2>학생 전용 접속 주소</h2><p>{url}</p></section>
    <section className="link-guide-notice"><h2>안내 및 보안 주의</h2><ul><li>이 주소는 해당 학생의 수시자료 입력에 사용되므로 다른 사람에게 전달하지 마세요.</li><li>입력 내용은 학생 본인과 학부모가 함께 확인해 주세요.</li><li>접속 또는 입력에 문제가 있으면 담임 선생님께 문의해 주세요.</li></ul></section>
    <footer>영동미래고등학교</footer>
  </article>)}</div>}</main>;
}

function GuideError({ message }: { message: string }) { return <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center"><h1 className="text-lg font-bold text-navy">안내문을 만들 수 없습니다.</h1><p className="mt-2 text-sm text-muted">{message}</p></div>; }
