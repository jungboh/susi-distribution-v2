import { PrintPageActions } from "@/components/print-page-actions";
import { StudentPrintDocument } from "@/components/student-print-document";
import { getAuthorizedStudentExportData } from "@/lib/student-export";

export const dynamic = "force-dynamic";

export default async function StudentPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await getAuthorizedStudentExportData(id);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-[210mm]">
        <PrintPageActions autoPrint={query.auto === "1"} />
        <StudentPrintDocument data={data} />
      </div>
    </main>
  );
}
