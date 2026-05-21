import { ClassForm } from "@/components/classes/class-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export default function NewClassPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/classes">Classes</BreadcrumbItem>
        <BreadcrumbItem>Add Class</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Add Class
      </h1>

      <ClassForm mode="create" />
    </div>
  );
}
