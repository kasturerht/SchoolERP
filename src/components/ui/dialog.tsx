"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-scrim/40",
        "data-[state=open]:animate-overlay-show data-[state=closed]:animate-overlay-hide"
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-[560px] -translate-x-1/2 -translate-y-1/2",
        "rounded-xl bg-surface-container-high p-6 shadow-elevation-3",
        "data-[state=open]:animate-overlay-show data-[state=closed]:animate-overlay-hide",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  DialogPrimitive.DialogTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-headline-sm font-semibold text-on-surface", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogPrimitive.DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-2 text-body-md text-on-surface-variant", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
