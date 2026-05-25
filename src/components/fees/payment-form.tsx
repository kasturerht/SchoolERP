"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  createFeePaymentSchema,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type CreateFeePaymentInput,
} from "@/lib/validations/fee-payment";

interface PaymentFormProps {
  pendingAmount: number;
  onSubmit: (data: CreateFeePaymentInput) => Promise<void>;
  submitting: boolean;
}

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

const METHODS_WITH_TXN_ID = new Set(["UPI", "ONLINE", "BANK_TRANSFER"]);

export function PaymentForm({
  pendingAmount,
  onSubmit,
  submitting,
}: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [method, setMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const numericAmount = parseFloat(amount) || 0;
  const remainingAfter = pendingAmount - numericAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const formData = {
      amount: numericAmount,
      method: method as CreateFeePaymentInput["method"],
      paidAt,
      transactionId,
      remarks,
    };

    const parsed = createFeePaymentSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parsed.error.errors) {
        fieldErrors[err.path.join(".")] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (numericAmount > pendingAmount) {
      setErrors({ amount: `Amount cannot exceed pending balance of ${formatCurrency(pendingAmount)}` });
      return;
    }

    await onSubmit(parsed.data);

    // Reset form on success
    setAmount("");
    setTransactionId("");
    setRemarks("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-label-lg text-on-surface-variant mb-1"
        >
          Amount
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          max={pendingAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xs border border-outline bg-transparent px-3 py-2 text-body-lg text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Enter amount"
        />
        {errors.amount && (
          <p className="text-error text-body-sm mt-1">{errors.amount}</p>
        )}
        {numericAmount > 0 && numericAmount <= pendingAmount && (
          <p className="text-body-sm text-on-surface-variant mt-1">
            Remaining after payment:{" "}
            <span className={remainingAfter > 0 ? "text-error font-medium" : "text-success font-medium"}>
              {formatCurrency(remainingAfter)}
            </span>
          </p>
        )}
      </div>

      {/* Payment Date */}
      <div>
        <label
          htmlFor="paidAt"
          className="block text-label-lg text-on-surface-variant mb-1"
        >
          Payment Date
        </label>
        <input
          id="paidAt"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          className="w-full rounded-xs border border-outline bg-transparent px-3 py-2 text-body-lg text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.paidAt && (
          <p className="text-error text-body-sm mt-1">{errors.paidAt}</p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-label-lg text-on-surface-variant mb-1">
          Payment Method
        </label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.method && (
          <p className="text-error text-body-sm mt-1">{errors.method}</p>
        )}
      </div>

      {/* Transaction ID — shown for UPI, Online, Bank Transfer */}
      {METHODS_WITH_TXN_ID.has(method) && (
        <div>
          <label
            htmlFor="transactionId"
            className="block text-label-lg text-on-surface-variant mb-1"
          >
            Transaction ID
          </label>
          <input
            id="transactionId"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full rounded-xs border border-outline bg-transparent px-3 py-2 text-body-lg text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Enter transaction ID"
            maxLength={100}
          />
        </div>
      )}

      {/* Remarks */}
      <div>
        <label
          htmlFor="remarks"
          className="block text-label-lg text-on-surface-variant mb-1"
        >
          Remarks
        </label>
        <input
          id="remarks"
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full rounded-xs border border-outline bg-transparent px-3 py-2 text-body-lg text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Optional remarks"
          maxLength={500}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="filled"
          icon="payments"
          loading={submitting}
          disabled={submitting}
        >
          Record Payment
        </Button>
      </div>
    </form>
  );
}
