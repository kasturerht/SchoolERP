import { StaffForm } from "@/components/staff/staff-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export default function NewStaffPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/staff">Staff</BreadcrumbItem>
        <BreadcrumbItem>Add Staff Member</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Add Staff Member
      </h1>
      <StaffForm mode="create" />
    </div>
  );
}
