import { AcademicYearForm } from "@/components/academic-years/academic-year-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export default function NewAcademicYearPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/academic-years">Academic Years</BreadcrumbItem>
        <BreadcrumbItem>Add Academic Year</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Add Academic Year
      </h1>

      <AcademicYearForm mode="create" />
    </div>
  );
}
