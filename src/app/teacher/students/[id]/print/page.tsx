import { PrintPageActions } from "@/components/print-page-actions";
import { StudentPrintDocument } from "@/components/student-print-document";
import { ParentConfirmationDocument } from "@/components/documents/parent-confirmation-document";
import { getAuthorizedStudentExportData } from "@/lib/student-export";

export const dynamic = "force-dynamic";

export default async function StudentPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string; mode?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await getAuthorizedStudentExportData(id);
  const parentConfirmation = query.mode === "parent";

  return (
    <main className={`min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0 ${parentConfirmation ? "parent-print-mode" : ""}`}>
      <div className={`mx-auto ${parentConfirmation ? "max-w-[210mm]" : "max-w-[297mm]"}`}>
        <PrintPageActions autoPrint={query.auto === "1"} />
        {parentConfirmation ? <ParentConfirmationDocument data={data} /> : <StudentPrintDocument data={data} />}
      </div>
    </main>
  );
}
