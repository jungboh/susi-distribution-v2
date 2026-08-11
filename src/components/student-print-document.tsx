import { CLASS_NAME_BY_CODE } from "@/lib/class-codes";
import {
  EXPORT_DOCUMENT_TITLE,
  EXPORT_SCHOOL_NAME,
  EXPORT_SCHOOL_YEAR,
  displayValue,
  formatExportDate,
  formatGeneratedDate,
  getFilledApplications,
  type StudentExportData,
} from "@/lib/student-export-shared";

export function StudentPrintDocument({ data }: { data: StudentExportData }) {
  const applications = getFilledApplications(data.applications);
  const className = CLASS_NAME_BY_CODE[data.student.class_code];

  return (
    <article className="print-page mx-auto max-w-[210mm] bg-white p-6 text-slate-800 shadow-sm print:max-w-none print:p-0 print:shadow-none">
      <header className="border-b-2 border-slate-700 pb-4">
        <p className="text-xs font-medium text-slate-500">
          {EXPORT_SCHOOL_YEAR}학년도 · {EXPORT_SCHOOL_NAME}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{EXPORT_DOCUMENT_TITLE}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Info label="학급" value={className} />
          <Info label="학번" value={data.student.student_number ?? "-"} />
          <Info label="이름" value={data.student.name} />
          <Info label="출력일" value={formatGeneratedDate()} />
        </dl>
      </header>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">지원대학 현황</h2>
        {applications.length === 0 ? (
          <EmptyMessage>등록된 지원대학이 없습니다.</EmptyMessage>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-300">
            <table className="w-full border-collapse text-[10px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <PrintTh>순번</PrintTh>
                  <PrintTh>대학명</PrintTh>
                  <PrintTh>학과</PrintTh>
                  <PrintTh>전형유형·전형명</PrintTh>
                  <PrintTh>전형방법</PrintTh>
                  <PrintTh>원서접수일</PrintTh>
                  <PrintTh>서류제출일</PrintTh>
                  <PrintTh>면접일</PrintTh>
                  <PrintTh>최종발표일</PrintTh>
                  <PrintTh>비고</PrintTh>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="align-top">
                    <PrintTd center>{application.seq}</PrintTd>
                    <PrintTd>{application.university_name}</PrintTd>
                    <PrintTd>{displayValue(application.department)}</PrintTd>
                    <PrintTd>
                      {displayValue(
                        [application.admission_type, application.admission_name]
                          .filter(Boolean)
                          .join(" · ")
                      )}
                    </PrintTd>
                    <PrintTd>{displayValue(application.admission_method)}</PrintTd>
                    <PrintTd>{formatExportDate(application.apply_start_date)}</PrintTd>
                    <PrintTd>{formatExportDate(application.document_submit_date)}</PrintTd>
                    <PrintTd>{formatExportDate(application.interview_date)}</PrintTd>
                    <PrintTd>{formatExportDate(application.final_announce_date)}</PrintTd>
                    <PrintTd>{displayValue(application.note)}</PrintTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-bold">학교별 제출서류 체크리스트</h2>
        {applications.length === 0 ? (
          <EmptyMessage>등록된 지원대학이 없습니다.</EmptyMessage>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const items = data.checklistItems.filter(
                (item) => item.application_id === application.id
              );
              const completed = items.filter((item) => item.is_submitted).length;

              return (
                <section
                  key={application.id}
                  className="application-section rounded-lg border border-slate-300 p-4"
                >
                  <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-2">
                    <h3 className="font-bold">
                      {application.seq}. {application.university_name}
                    </h3>
                    <span className="text-xs text-slate-500">
                      완료 {completed}/{items.length}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <p className="py-3 text-sm text-slate-500">
                      등록된 제출서류가 없습니다.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span aria-hidden="true" className="font-mono">
                            {item.is_submitted ? "☑" : "☐"}
                          </span>
                          <span className="flex-1">
                            {item.label}
                            {item.note && (
                              <span className="ml-2 text-xs text-slate-500">
                                비고: {item.note}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

function PrintTh({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-r border-slate-300 p-2 text-left font-bold last:border-r-0">{children}</th>;
}

function PrintTd({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <td
      className={`border-b border-r border-slate-200 p-2 last:border-r-0 ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
