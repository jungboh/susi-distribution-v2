import { CLASS_UI_NAME_BY_CODE } from "@/lib/class-codes";
import {
  EXPORT_SCHOOL_NAME,
  EXPORT_SCHOOL_YEAR,
  formatGeneratedDate,
  getFilledApplications,
  type StudentExportData,
} from "@/lib/student-export-shared";

export function ParentConfirmationDocument({ data }: { data: StudentExportData }) {
  const applications = getFilledApplications(data.applications);
  const className = CLASS_UI_NAME_BY_CODE[data.student.class_code];

  return (
    <article className="parent-confirmation-document mx-auto flex min-h-[273mm] max-w-[210mm] flex-col bg-white px-7 py-6 text-[#111827] shadow-sm print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
      <header className="border-b-2 border-[#12254f] pb-5 text-center text-[#12254f]">
        <p className="text-2xl font-extrabold tracking-tight">{EXPORT_SCHOOL_NAME}</p>
        <h1 className="mt-2 text-[27px] font-extrabold tracking-tight">
          {EXPORT_SCHOOL_YEAR}학년도 {className} 수시 지원 관리 현황
        </h1>
      </header>

      <DocumentSection number="1" title="학생 기본정보">
        <table className="w-full table-fixed border-collapse text-sm">
          <tbody>
            <InfoRow leftLabel="학번" leftValue={data.student.student_number ?? "-"} rightLabel="이름" rightValue={data.student.name} />
            <InfoRow leftLabel="학급" leftValue={className} rightLabel="출력일" rightValue={formatGeneratedDate()} />
          </tbody>
        </table>
      </DocumentSection>

      <DocumentSection number="2" title="지원대학 현황">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-[#12254f] text-white">
            <tr>
              <UniversityTh className="w-[24%]">지원대학</UniversityTh>
              <UniversityTh className="w-[24%]">모집단위</UniversityTh>
              <UniversityTh className="w-[22%]">전형명</UniversityTh>
              <UniversityTh className="w-[16%]">서류준비상태</UniversityTh>
              <UniversityTh className="w-[14%]">비고</UniversityTh>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr><td colSpan={5} className="border border-slate-300 px-3 py-6 text-center text-slate-500">등록된 지원대학이 없습니다.</td></tr>
            ) : applications.map((application) => {
              const items = data.checklistItems.filter((item) => item.application_id === application.id);
              const status = items.length === 0 ? "미등록" : items.every((item) => item.is_submitted) ? "완료" : "준비중";
              return (
                <tr key={application.id} className="university-row text-center">
                  <UniversityTd>{application.university_name}</UniversityTd>
                  <UniversityTd>{application.department || "-"}</UniversityTd>
                  <UniversityTd>{application.admission_name || application.admission_type || "-"}</UniversityTd>
                  <UniversityTd><span className="font-semibold">{status}</span></UniversityTd>
                  <UniversityTd>{application.remarks || "-"}</UniversityTd>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DocumentSection>

      <DocumentSection number="3" title="제출서류 준비현황">
        {data.checklistItems.length === 0 ? (
          <p className="border border-slate-300 px-4 py-6 text-center text-sm text-slate-500">등록된 제출서류가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 border-l border-t border-slate-300 text-sm">
            {[...data.checklistItems].sort((a, b) => a.sort_order - b.sort_order).map((item) => {
              const application = applications.find((entry) => entry.id === item.application_id);
              return (
                <div key={item.id} className="checklist-row flex min-h-12 items-center justify-between gap-3 border-b border-r border-slate-300 px-4 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-slate-500 text-[11px] leading-none">{item.is_submitted ? "✓" : ""}</span>
                    <span className="min-w-0">{application && <span className="block truncate text-[10px] text-slate-500">{application.university_name}</span>}<span className="block">{item.label}</span></span>
                  </div>
                  <span className="shrink-0 font-semibold">{item.is_submitted ? "제출완료" : "미제출"}</span>
                </div>
              );
            })}
          </div>
        )}
      </DocumentSection>

      <ParentConfirmation />
      <footer className="mt-auto border-t-2 border-[#12254f] pt-3 text-sm font-semibold text-[#12254f]">{EXPORT_SCHOOL_NAME}</footer>
    </article>
  );
}

function ParentConfirmation() {
  return (
    <section className="parent-confirmation mt-7 border-t border-dashed border-[#12254f] pt-5 text-sm">
      <h2 className="text-center text-xl font-bold text-[#12254f]">학부모 확인</h2>
      <p className="mt-4 text-center leading-7">위 학생의 2026학년도 수시모집 지원대학,<br />전형 일정 및 제출서류 준비 현황을 확인하였습니다.</p>
      <p className="mt-6 text-center">2026년&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;일</p>
      <div className="mx-auto mt-6 grid max-w-[560px] grid-cols-[125px_1fr] items-end gap-x-4 gap-y-5">
        <span>학생과의 관계 :</span><span className="border-b border-slate-700">&nbsp;</span>
        <span>학부모 성명 :</span><span className="border-b border-slate-700 pb-1"><span className="float-right translate-x-14">(서명)</span></span>
      </div>
    </section>
  );
}

function DocumentSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="document-section mt-6"><h2 className="mb-3 text-base font-bold text-[#12254f]">{number}. {title}</h2>{children}</section>;
}
function InfoRow({ leftLabel, leftValue, rightLabel, rightValue }: { leftLabel: string; leftValue: string; rightLabel: string; rightValue: string }) {
  return <tr><InfoLabel>{leftLabel}</InfoLabel><InfoValue>{leftValue}</InfoValue><InfoLabel>{rightLabel}</InfoLabel><InfoValue>{rightValue}</InfoValue></tr>;
}
function InfoLabel({ children }: { children: React.ReactNode }) { return <th className="w-[17%] border border-slate-300 bg-slate-50 px-3 py-2.5 text-center font-bold">{children}</th>; }
function InfoValue({ children }: { children: React.ReactNode }) { return <td className="w-[33%] border border-slate-300 px-4 py-2.5">{children}</td>; }
function UniversityTh({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <th scope="col" className={`border border-[#71809e] px-3 py-2.5 font-bold ${className}`}>{children}</th>; }
function UniversityTd({ children }: { children: React.ReactNode }) { return <td className="border border-slate-300 px-3 py-2.5 break-words">{children}</td>; }
