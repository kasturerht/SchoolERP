"use client";

import { cn } from "@/lib/utils";

type ChipVariant = "filled" | "outlined";
type ChipColor = "default" | "primary" | "success" | "error" | "warning";

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: ChipColor;
  icon?: string;
  className?: string;
}

const colorStyles: Record<ChipColor, Record<ChipVariant, string>> = {
  default: {
    filled: "bg-surface-container-high text-on-surface",
    outlined: "border border-outline text-on-surface",
  },
  primary: {
    filled: "bg-primary-container text-on-primary-container",
    outlined: "border border-primary text-primary",
  },
  success: {
    filled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    outlined: "border border-green-600 text-green-700 dark:text-green-400",
  },
  error: {
    filled: "bg-error-container text-on-error-container",
    outlined: "border border-error text-error",
  },
  warning: {
    filled: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    outlined: "border border-amber-600 text-amber-700 dark:text-amber-400",
  },
};

export function Chip({
  label,
  variant = "filled",
  color = "default",
  icon,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5",
        "text-label-md font-medium whitespace-nowrap",
        colorStyles[color][variant],
        className
      )}
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      )}
      {label}
    </span>
  );
}
