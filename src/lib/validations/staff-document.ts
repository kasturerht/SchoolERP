import { z } from "zod";

export const DOCUMENT_LABEL_OPTIONS = [
  "Aadhaar",
  "PAN Card",
  "Resume",
  "Degree Certificate",
  "Experience Letter",
  "Photo ID",
  "Other",
] as const;

export const staffDocumentLabelSchema = z
  .string()
  .min(1, "Label is required")
  .max(100, "Label must be at most 100 characters");
