import { z } from "zod";

export const PAYMENT_METHODS = [
  "CASH",
  "ONLINE",
  "CHEQUE",
  "BANK_TRANSFER",
  "UPI",
] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
  BANK_TRANSFER: "Bank Transfer",
  ONLINE: "Online",
};

export const createFeePaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.enum(PAYMENT_METHODS, { required_error: "Payment method is required" }),
  paidAt: z.string().min(1, "Payment date is required"),
  transactionId: z.string().max(100).optional().or(z.literal("")),
  remarks: z.string().max(500).optional().or(z.literal("")),
});

export type CreateFeePaymentInput = z.infer<typeof createFeePaymentSchema>;
