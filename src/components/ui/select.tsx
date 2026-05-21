"use client";

import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/* ─── Root ─────────────────────────────────────────────────── */

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

/* ─── Trigger ──────────────────────────────────────────────── */

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  SelectPrimitive.SelectTriggerProps & { fullWidth?: boolean }
>(({ className, children, fullWidth, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "state-layer focus-ring inline-flex items-center justify-between gap-2",
      "h-[56px] rounded-sm px-4",
      "border border-outline bg-transparent text-on-surface text-body-lg",
      "after:bg-on-surface-variant",
      "data-[placeholder]:text-on-surface-variant",
      "disabled:opacity-38 disabled:cursor-not-allowed",
      fullWidth && "w-full",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon name="expand_more" size={20} className="text-on-surface-variant shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

/* ─── Content ──────────────────────────────────────────────── */

export const SelectContent = forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectContentProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-sm bg-surface-container shadow-elevation-2",
        "min-w-[var(--radix-select-trigger-width)]",
        className
      )}
      position="popper"
      sideOffset={4}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

/* ─── Item ─────────────────────────────────────────────────── */

export const SelectItem = forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectItemProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "state-layer relative flex cursor-pointer items-center gap-2",
      "rounded-xs px-3 py-2 text-body-md text-on-surface outline-none",
      "after:bg-on-surface",
      "data-[highlighted]:bg-on-surface/8",
      "data-[disabled]:opacity-38 data-[disabled]:cursor-not-allowed",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="ml-auto">
      <Icon name="check" size={18} className="text-primary" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";
