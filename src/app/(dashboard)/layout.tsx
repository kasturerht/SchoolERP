import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PermissionsProvider } from "@/hooks/use-permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <PermissionsProvider>
      <DashboardShell
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.roleName,
          organizationName: session.user.organizationName,
          organizationLogo: session.user.organizationLogo,
        }}
      >
        {children}
      </DashboardShell>
    </PermissionsProvider>
  );
}
