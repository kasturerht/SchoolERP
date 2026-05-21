"use client";

import { cn } from "@/lib/utils";
import { Card } from "./card";
import { Icon } from "./icon";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: "primary" | "secondary" | "tertiary";
  className?: string;
}

const colorMap = {
  primary: {
    bg: "bg-primary-container",
    text: "text-on-primary-container",
  },
  secondary: {
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
  },
  tertiary: {
    bg: "bg-tertiary-container",
    text: "text-on-tertiary-container",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  color = "primary",
  className,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card variant="filled" className={cn("p-4", className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-md",
            colors.bg
          )}
        >
          <Icon name={icon} size={24} className={colors.text} />
        </div>
        <div>
          <p className="text-label-lg text-on-surface-variant">{title}</p>
          <p className="text-headline-md font-semibold text-on-surface">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
