"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ icon, label, size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 w-10",
      md: label ? "h-14 px-4 gap-2" : "h-14 w-14",
      lg: "h-24 w-24",
    };

    const iconSize = {
      sm: 20,
      md: 24,
      lg: 36,
    };

    return (
      <button
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-40 md:hidden",
          "inline-flex items-center justify-center rounded-lg",
          "bg-primary-container text-on-primary-container",
          "shadow-elevation-3 hover:shadow-elevation-4",
          "transition-shadow duration-200 cursor-pointer",
          "focus-ring",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Icon name={icon} size={iconSize[size]} />
        {label && <span className="text-label-lg font-medium">{label}</span>}
      </button>
    );
  }
);

FAB.displayName = "FAB";
