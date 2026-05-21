"use client";

import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  HTMLDivElement,
  TabsPrimitive.TabsListProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex border-b border-outline-variant overflow-x-auto",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  TabsPrimitive.TabsTriggerProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative px-4 py-3 text-label-lg font-medium text-on-surface-variant whitespace-nowrap",
      "transition-colors cursor-pointer",
      "hover:text-on-surface hover:bg-on-surface/4",
      "focus-visible:outline-none focus-visible:bg-on-surface/8",
      "data-[state=active]:text-primary",
      "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[3px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-t-full",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef<
  HTMLDivElement,
  TabsPrimitive.TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
