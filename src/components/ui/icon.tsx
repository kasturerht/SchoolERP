"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number;
  filled?: boolean;
}

export function Icon({
  name,
  size = 24,
  filled = false,
  className,
  ...props
}: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        filled && "font-variation-fill",
        className
      )}
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
      {...props}
    >
      {name}
    </span>
  );
}
