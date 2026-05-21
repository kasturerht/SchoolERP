"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export interface Branch {
  id: string;
  name: string;
  code: string;
  isMain: boolean;
}

interface UseBranchesReturn {
  branches: Branch[];
  isLoading: boolean;
}

export function useBranches(): UseBranchesReturn {
  const { data: session, status } = useSession();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setBranches([]);
      setIsLoading(false);
      return;
    }

    fetch("/api/v1/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBranches(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [session, status]);

  return { branches, isLoading };
}
