"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface PermissionsContextType {
  permissions: Set<string>;
  can: (module: string, action: string) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setPermissions(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Fetch permissions from API once for the entire dashboard session
    fetch("/api/v1/me/permissions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPermissions(new Set(data.data.permissions));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [session, status]);

  const can = useCallback((module: string, action: string): boolean => {
    if (session?.user?.roleName === "SUPER_ADMIN" || session?.user?.roleName === "SCHOOL_ADMIN") {
      return true;
    }
    return permissions.has(`${module}:${action}`);
  }, [session, permissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, can, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
