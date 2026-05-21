"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-highest animate-pulse rounded-xs",
        className
      )}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-outline-variant">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-outline-variant last:border-b-0"
            >
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton
                    className={cn(
                      "h-4",
                      colIdx === 0 ? "w-32" : "w-20"
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-full rounded-sm" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}
