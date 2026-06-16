"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatIndianNumber } from "@/lib/utils-format";

interface BaseCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BaseCurrencyInput = React.forwardRef<HTMLInputElement, BaseCurrencyInputProps>(
  ({ value, onChange, onBlur, onFocus, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");
    const internalInputRef = useRef<HTMLInputElement>(null);

    // Sync display value when state changes externally
    useEffect(() => {
      if (value === undefined || value === null || value === "") {
        setDisplayValue("");
        return;
      }
      const clean = value.toString().replace(/,/g, "");
      const formatted = formatIndianNumber(clean);
      setDisplayValue(formatted);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const rawInputVal = input.value;
      
      // Keep only valid numeric characters
      const cleanVal = rawInputVal.replace(/[^\d.-]/g, "");
      const formatted = formatIndianNumber(cleanVal);
      setDisplayValue(formatted);

      // Track selection cursor position
      const selectionStart = input.selectionStart || 0;
      const charsBeforeCursor = rawInputVal.substring(0, selectionStart).replace(/,/g, "").length;

      // Pass simulated event with clean numeric string
      const simulatedEvent = {
        ...e,
        target: {
          ...input,
          name: props.name || "",
          value: cleanVal,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(simulatedEvent);

      // Re-apply selection cursor after update
      requestAnimationFrame(() => {
        const targetInput = internalInputRef.current || input;
        if (!targetInput) return;
        
        let newSelectionStart = 0;
        let charsSeen = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (formatted[i] !== ",") {
            charsSeen++;
          }
          if (charsSeen === charsBeforeCursor) {
            newSelectionStart = i + 1;
            break;
          }
        }
        targetInput.setSelectionRange(newSelectionStart, newSelectionStart);
      });
    };

    return (
      <input
        ref={(el) => {
          (internalInputRef as any).current = el;
          if (typeof ref === "function") {
            ref(el);
          } else if (ref) {
            (ref as any).current = el;
          }
        }}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        className={className}
        {...props}
      />
    );
  }
);

BaseCurrencyInput.displayName = "BaseCurrencyInput";
