"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface NavItemData {
  label: string;
  href: string;
  icon: string;
}

interface NavItemProps {
  item: NavItemData;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({ item, collapsed = false, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-full px-4 py-3 text-label-lg font-medium transition-colors",
        "state-layer focus-ring",
        isActive
          ? "bg-secondary-container text-on-secondary-container after:bg-on-secondary-container"
          : "text-on-surface-variant after:bg-on-surface-variant hover:bg-on-surface/8",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon
        name={item.icon}
        size={24}
        filled={isActive}
        className="shrink-0"
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
