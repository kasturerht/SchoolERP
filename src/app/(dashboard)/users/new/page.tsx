import { UserForm } from "@/components/users/user-form";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export default function NewUserPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/users">Users</BreadcrumbItem>
        <BreadcrumbItem>Add User</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Add User
      </h1>
      <UserForm mode="create" />
    </div>
  );
}
