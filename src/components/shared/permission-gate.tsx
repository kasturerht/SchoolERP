"use client";

import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGateProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  module,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) return null;
  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}
