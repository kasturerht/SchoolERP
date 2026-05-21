import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { UserListClient } from "@/components/users/user-list-client";

export default function UsersPage() {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Users</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-headline-md font-semibold text-on-surface mb-6">
        Users
      </h1>
      <UserListClient />
    </div>
  );
}
