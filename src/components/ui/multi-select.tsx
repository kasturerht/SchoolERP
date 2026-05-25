"use client";

import { useState, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  fullWidth = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  const selectedCount = value.length;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "state-layer focus-ring inline-flex items-center justify-between gap-2",
            "h-[56px] rounded-sm px-4",
            "border border-outline bg-transparent text-body-lg",
            "after:bg-on-surface-variant",
            "disabled:opacity-38 disabled:cursor-not-allowed",
            selectedCount > 0 ? "text-on-surface" : "text-on-surface-variant",
            fullWidth && "w-full",
            className
          )}
        >
          <span className="truncate">
            {selectedCount > 0
              ? `${selectedCount} teacher${selectedCount !== 1 ? "s" : ""} selected`
              : placeholder}
          </span>
          <Icon
            name="expand_more"
            size={20}
            className="text-on-surface-variant shrink-0"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-50 overflow-hidden rounded-sm bg-surface-container shadow-elevation-2",
            "min-w-[var(--radix-popover-trigger-width)] max-h-72 flex flex-col"
          )}
          sideOffset={4}
          align="start"
        >
          <div className="px-3 pt-3 pb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xs border border-outline-variant bg-transparent px-3 py-1.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary"
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-body-sm text-on-surface-variant">
                No results found
              </p>
            )}
            {filtered.map((option) => {
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xs px-3 py-2 text-body-md text-on-surface",
                    "hover:bg-on-surface/8"
                  )}
                >
                  <Checkbox.Root
                    checked={checked}
                    onCheckedChange={() => toggle(option.value)}
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border-2",
                      checked
                        ? "border-primary bg-primary"
                        : "border-on-surface-variant bg-transparent"
                    )}
                  >
                    <Checkbox.Indicator>
                      <Icon name="check" size={14} className="text-on-primary" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span className="truncate">{option.label}</span>
                </label>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
