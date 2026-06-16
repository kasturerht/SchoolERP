"use client";

import React, { useState, useEffect, useRef } from "react";
import { TextField } from "./text-field";
import { formatIndianNumber } from "@/lib/utils-format";

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof TextField>, "value" | "onChange" | "type"> {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, onBlur, onFocus, ...props }, ref) => {
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
      
      // Keep only valid numeric characters (digits, decimal dot, negative sign)
      const cleanVal = rawInputVal.replace(/[^\d.-]/g, "");
      const formatted = formatIndianNumber(cleanVal);
      setDisplayValue(formatted);

      // Track how many digits/dots are before the cursor in the typed value
      const selectionStart = input.selectionStart || 0;
      const charsBeforeCursor = rawInputVal.substring(0, selectionStart).replace(/,/g, "").length;

      // Pass the clean numeric value to the parent's onChange handler
      const simulatedEvent = {
        ...e,
        target: {
          ...input,
          name: props.name || "",
          value: cleanVal,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(simulatedEvent);

      // Re-apply selection cursor to prevent caret jumping
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
      <TextField
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
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
