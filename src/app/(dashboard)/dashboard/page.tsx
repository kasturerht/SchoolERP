import { auth } from "@/lib/auth";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl">
      <DashboardContent 
        userName={session?.user.name} 
        roleName={session?.user.roleName} 
      />
    </div>
  );
}
