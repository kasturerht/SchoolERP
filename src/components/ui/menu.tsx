"use client";

import { forwardRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export const Menu = DropdownMenuPrimitive.Root;
export const MenuTrigger = DropdownMenuPrimitive.Trigger;

export const MenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuContentProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={4}
      align="end"
      className={cn(
        "z-50 min-w-[180px] overflow-hidden rounded-xs bg-surface-container p-1 shadow-elevation-2",
        "data-[state=open]:animate-overlay-show data-[state=closed]:animate-overlay-hide",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
MenuContent.displayName = "MenuContent";

interface MenuItemProps extends DropdownMenuPrimitive.DropdownMenuItemProps {
  icon?: string;
  destructive?: boolean;
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, icon, destructive, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "state-layer relative flex cursor-pointer items-center gap-2 rounded-xs px-3 py-2 text-body-md outline-none",
        "after:bg-on-surface",
        "data-[highlighted]:bg-on-surface/8",
        destructive ? "text-error" : "text-on-surface",
        className
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </DropdownMenuPrimitive.Item>
  )
);
MenuItem.displayName = "MenuItem";

export const MenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-outline-variant", className)}
    {...props}
  />
));
MenuSeparator.displayName = "MenuSeparator";
