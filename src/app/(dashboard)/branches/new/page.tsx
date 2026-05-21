import { BranchForm } from "@/components/branches/branch-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export default function NewBranchPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/branches">Branches</BreadcrumbItem>
        <BreadcrumbItem>Add Branch</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Add Branch
      </h1>
      <BranchForm mode="create" />
    </div>
  );
}
