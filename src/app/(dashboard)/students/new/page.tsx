import { StudentForm } from "@/components/student/student-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewStudentPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams.bypassRedirect !== "true") {
    redirect("/admissions");
  }
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/students">Students</BreadcrumbItem>
        <BreadcrumbItem>Direct Intake</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Direct Intake / Data Migration
      </h1>

      {/* Migration Alert Warning Banner */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-amber-800 text-body-sm mb-6 items-start shadow-sm shadow-amber-50">
        <span className="material-symbols-outlined text-amber-600 shrink-0 select-none">warning</span>
        <div>
          <p className="font-bold">Data Migration / Direct Intake Mode</p>
          <p className="text-xs text-amber-700/90 mt-0.5">
            Use this form only to load existing old student data for the school or for students transferred mid-year (Transfer Intake). All regular admissions for the new academic year must be processed through the <strong>Admissions Desk</strong>.
          </p>
        </div>
      </div>

      <StudentForm mode="create" />
    </div>
  );
}
