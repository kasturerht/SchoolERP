"use client";

import { useEffect } from "react";

interface FormSuccessProps {
  onAnimationComplete?: () => void;
  message?: string;
}

export function FormSuccess({ onAnimationComplete, message = "Saved Successfully!" }: FormSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-300">
      <div className="relative size-16 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 shadow-2xs border border-emerald-100 dark:border-emerald-900/30">
        <svg
          className="size-8 stroke-emerald-600 dark:stroke-emerald-400"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            className="animate-checkmark"
            d="M20 6 9 17l-5-5"
            style={{
              strokeDasharray: 22,
              strokeDashoffset: 22,
              animation: "checkmark-anim 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards",
            }}
          />
        </svg>
      </div>
      <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mt-4">
        {message}
      </h3>
      
      <style>{`
        @keyframes checkmark-anim {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
