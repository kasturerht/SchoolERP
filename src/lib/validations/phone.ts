import { z } from "zod";

export const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;

/**
 * Strips spaces, hyphens, and parentheses from phone number inputs.
 * Keeps '+' for country code.
 */
export const sanitizePhone = (val: unknown): unknown => {
  if (typeof val !== "string") return val;
  return val.replace(/[\s\-()]/g, "");
};

// Required phone validation (tolerant of spacing/hyphens)
export const requiredPhoneSchema = z
  .preprocess((val) => sanitizePhone(val), z.string())
  .refine((val) => val.trim().length > 0, { message: "Phone number is required" })
  .refine((val) => indianPhoneRegex.test(val), {
    message: "Invalid Indian mobile number (e.g. 98765 43210)",
  });

// Optional phone validation (tolerant of spacing/hyphens, accepts empty inputs)
export const optionalPhoneSchema = z
  .preprocess((val) => sanitizePhone(val), z.string().optional().or(z.literal("")))
  .refine((val) => {
    if (!val || val.trim() === "") return true;
    return indianPhoneRegex.test(val);
  }, {
    message: "Invalid Indian mobile number (e.g. 98765 43210)",
  });
