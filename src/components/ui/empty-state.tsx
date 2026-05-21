"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-highest mb-4">
        <Icon name={icon} size={48} className="text-on-surface-variant" />
      </div>
      <h3 className="text-title-md font-medium text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-body-md text-on-surface-variant max-w-xs mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
