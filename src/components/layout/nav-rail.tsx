"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { NavItemData } from "./nav-item";

interface NavRailProps {
  items: NavItemData[];
  onMenuClick: () => void;
  className?: string;
}

export function NavRail({ items, onMenuClick, className }: NavRailProps) {
  const pathname = usePathname();

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside
        className={cn(
          "flex h-full w-20 flex-col items-center border-r border-outline-variant bg-surface",
          className
        )}
      >
        {/* Menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="state-layer focus-ring mt-2 flex h-14 w-14 items-center justify-center rounded-full text-on-surface-variant after:bg-on-surface-variant"
          aria-label="Open navigation menu"
        >
          <Icon name="menu" size={24} />
        </button>

        {/* Nav items */}
        <nav className="mt-4 flex flex-1 flex-col items-center gap-1 overflow-y-auto pb-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Tooltip.Root key={item.href}>
                <Tooltip.Trigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "state-layer focus-ring flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-secondary-container text-on-secondary-container after:bg-on-secondary-container"
                        : "text-on-surface-variant after:bg-on-surface-variant"
                    )}
                  >
                    <Icon
                      name={item.icon}
                      size={24}
                      filled={isActive}
                    />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="z-50 rounded-xs bg-inverse-surface px-3 py-1.5 text-label-md text-inverse-on-surface shadow-elevation-2"
                  >
                    {item.label}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </nav>
      </aside>
    </Tooltip.Provider>
  );
}
