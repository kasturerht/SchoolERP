"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className, id, ...props }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full",
          "transition-colors duration-200 focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-38",
          checked
            ? "bg-primary"
            : "bg-surface-container-highest border-2 border-outline",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-elevation-1",
            "transition-all duration-200",
            checked
              ? "h-6 w-6 translate-x-[26px]"
              : "h-4 w-4 translate-x-[6px] bg-outline"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
