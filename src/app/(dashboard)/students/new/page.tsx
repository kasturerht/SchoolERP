import { StudentForm } from "@/components/student/student-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export default function NewStudentPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/students">Students</BreadcrumbItem>
        <BreadcrumbItem>Add Student</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Add Student
      </h1>
      <StudentForm mode="create" />
    </div>
  );
}
