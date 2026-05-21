"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "filled" | "outlined" | "text" | "tonal" | "elevated";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "leading" | "trailing";
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  filled: [
    "bg-primary text-on-primary",
    "hover:shadow-elevation-1",
    "after:bg-on-primary",
    "disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none",
  ].join(" "),
  outlined: [
    "border border-outline text-primary bg-transparent",
    "after:bg-primary",
    "disabled:border-on-surface/12 disabled:text-on-surface/38",
  ].join(" "),
  text: [
    "text-primary bg-transparent",
    "after:bg-primary",
    "disabled:text-on-surface/38",
  ].join(" "),
  tonal: [
    "bg-secondary-container text-on-secondary-container",
    "hover:shadow-elevation-1",
    "after:bg-on-secondary-container",
    "disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none",
  ].join(" "),
  elevated: [
    "bg-surface-container-low text-primary shadow-elevation-1",
    "hover:shadow-elevation-2",
    "after:bg-primary",
    "disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label-md gap-1.5",
  md: "h-10 px-6 text-label-lg gap-2",
  lg: "h-12 px-8 text-label-lg gap-2",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "filled",
      size = "md",
      icon,
      iconPosition = "leading",
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isIconOnly = icon && !children;
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "state-layer relative inline-flex items-center justify-center",
          "font-medium rounded-full",
          "transition-shadow duration-200",
          "focus-ring cursor-pointer",
          "disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variant
          variantStyles[variant],
          // Size
          isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && (
          <span className="material-symbols-outlined text-[18px] animate-spin">
            progress_activity
          </span>
        )}
        {!loading && icon && iconPosition === "leading" && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "trailing" && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
