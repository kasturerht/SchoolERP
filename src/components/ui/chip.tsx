"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

type ChipVariant = "filled" | "outlined";
type ChipColor = "default" | "primary" | "success" | "error" | "warning";

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: ChipColor;
  icon?: string;
  className?: string;
}

const textColors: Record<ChipColor, string> = {
  default: "text-slate-700 dark:text-slate-300 font-semibold",
  primary: "text-teal-700 dark:text-teal-300 font-semibold",
  success: "text-emerald-700 dark:text-emerald-300 font-semibold",
  error: "text-rose-700 dark:text-rose-300 font-semibold",
  warning: "text-amber-700 dark:text-amber-300 font-semibold",
};

const borderColors: Record<ChipColor, string> = {
  default: "border-slate-200 dark:border-slate-800/80",
  primary: "border-teal-500/20 dark:border-teal-500/30",
  success: "border-emerald-500/20 dark:border-emerald-500/30",
  error: "border-rose-500/20 dark:border-rose-500/30",
  warning: "border-amber-500/20 dark:border-amber-500/30",
};

const bgColors: Record<ChipColor, string> = {
  default: "bg-gradient-to-r from-slate-500/5 to-slate-500/[0.02] dark:from-slate-500/10 dark:to-slate-500/5 backdrop-blur-[1px]",
  primary: "bg-gradient-to-r from-teal-500/10 to-teal-500/5 dark:from-teal-500/20 dark:to-teal-500/10 backdrop-blur-[1px] shadow-[0_2px_8px_rgba(15,118,110,0.04)]",
  success: "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 backdrop-blur-[1px] shadow-[0_2px_8px_rgba(16,185,129,0.04)]",
  error: "bg-gradient-to-r from-rose-500/10 to-rose-500/5 dark:from-rose-500/20 dark:to-rose-500/10 backdrop-blur-[1px] shadow-[0_2px_8px_rgba(244,63,94,0.04)]",
  warning: "bg-gradient-to-r from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10 backdrop-blur-[1px] shadow-[0_2px_8px_rgba(245,158,11,0.04)]",
};

const indicatorDotColors: Record<ChipColor, string> = {
  default: "bg-slate-400 dark:bg-slate-500",
  primary: "bg-teal-500 shadow-[0_0_6px_rgba(15,118,110,0.4)]",
  success: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] animate-pulse",
  error: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]",
  warning: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0 border text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-200 self-center my-auto leading-none hover:scale-[1.02] cursor-default select-none",
        variant === "filled" ? bgColors[color] : "bg-transparent",
        borderColors[color],
        textColors[color],
        className
      )}
      style={{ height: "22px", lineHeight: "1", alignSelf: "center" }}
    >
      {icon ? (
        <Icon name={icon} size={11} className="shrink-0 opacity-80" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", indicatorDotColors[color])} />
      )}
      {label}
    </span>
  );
}
