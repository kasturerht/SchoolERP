"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface DiscardConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DiscardConfirmDialog({ open, onClose, onConfirm }: DiscardConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] bg-slate-900/30 dark:bg-zinc-950/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[10001] w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-slate-100 dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] focus:outline-none transition-all duration-200 animate-in fade-in zoom-in-95">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Discard unsaved changes?
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
            You have unsaved changes in this form. If you discard them now, all filled details will be lost forever.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              className="rounded-xl h-10 px-4 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-850 transition-all duration-200 cursor-pointer"
            >
              Keep Editing
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="rounded-xl h-10 px-4 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-sm transition-all duration-200 cursor-pointer"
            >
              Discard Changes
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
