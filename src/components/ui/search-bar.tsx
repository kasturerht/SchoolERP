"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onClear, placeholder = "Search", className, ...props }, ref) => {
    function handleClear() {
      onChange("");
      onClear?.();
    }

    return (
      <div
        className={cn(
          "relative flex h-14 items-center gap-2 rounded-full bg-surface-container-high px-4",
          className
        )}
      >
        <Icon name="search" size={20} className="text-on-surface-variant shrink-0" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-body-lg text-on-surface outline-none placeholder:text-on-surface-variant"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-1 hover:bg-on-surface/8 cursor-pointer"
          >
            <Icon name="close" size={18} className="text-on-surface-variant" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
