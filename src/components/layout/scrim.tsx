"use client";

import { cn } from "@/lib/utils";

interface ScrimProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function Scrim({ open, onClose, className }: ScrimProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-scrim/32 transition-opacity",
        className
      )}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
