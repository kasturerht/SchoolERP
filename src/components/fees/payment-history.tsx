"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/fee-payment";
import { Icon } from "@/components/ui/icon";

interface Payment {
  id: string;
  receiptNo: string | null;
  amount: number;
  method: string;
  transactionId: string | null;
  paidAt: string;
  remarks: string | null;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const columns: Column<Payment>[] = [
    {
      key: "receiptNo",
      header: "Receipt No",
      minWidth: 155,
      render: (row) => {
        if (!row.receiptNo) return "—";
        return (
          <span className="font-mono bg-slate-50 dark:bg-slate-900 px-2 py-0.5 border border-slate-200/50 dark:border-slate-800 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {row.receiptNo}
          </span>
        );
      },
    },
    {
      key: "paidAt",
      header: "Date",
      minWidth: 115,
      sortValue: (row) => row.paidAt,
      render: (row) => {
        const d = new Date(row.paidAt);
        if (isNaN(d.getTime())) return "—";
        return (
          <span className="text-slate-650 dark:text-slate-350 text-sm font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
            {d.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      minWidth: 110,
      sortValue: (row) => row.amount,
      render: (row) => (
        <span className="font-extrabold text-slate-900 dark:text-slate-50">
          ₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      minWidth: 105,
      render: (row) => {
        const label = PAYMENT_METHOD_LABELS[row.method] ?? row.method;
        let style = "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700";
        let dotColor = "bg-slate-400";
        if (row.method === "UPI") {
          style = "bg-indigo-500/[0.04] text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/[0.02] dark:text-indigo-400 dark:border-indigo-500/10";
          dotColor = "bg-indigo-500";
        } else if (row.method === "CASH") {
          style = "bg-purple-500/[0.04] text-purple-700 border-purple-500/20 dark:bg-purple-500/[0.02] dark:text-purple-400 dark:border-purple-500/10";
          dotColor = "bg-purple-500";
        } else if (row.method === "ONLINE") {
          style = "bg-teal-500/[0.04] text-teal-700 border-teal-500/20 dark:bg-teal-500/[0.02] dark:text-teal-400 dark:border-teal-500/10";
          dotColor = "bg-teal-500";
        } else if (row.method === "BANK_TRANSFER") {
          style = "bg-amber-500/[0.04] text-amber-700 border-amber-500/20 dark:bg-amber-500/[0.02] dark:text-amber-400 dark:border-amber-500/10";
          dotColor = "bg-amber-500";
        } else if (row.method === "CHEQUE") {
          style = "bg-cyan-500/[0.04] text-cyan-700 border-cyan-500/20 dark:bg-cyan-500/[0.02] dark:text-cyan-400 dark:border-cyan-500/10";
          dotColor = "bg-cyan-500";
        }
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wider ${style}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {label}
          </span>
        );
      },
    },
    {
      key: "transactionId",
      header: "Transaction ID",
      minWidth: 160,
      render: (row) => {
        if (!row.transactionId) return "—";
        return (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-650 dark:text-slate-400">
            <span className="truncate max-w-[120px]" title={row.transactionId}>{row.transactionId}</span>
            <button
              type="button"
              title="Copy Transaction ID"
              onClick={() => {
                navigator.clipboard.writeText(row.transactionId || "");
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200/50"
            >
              <Icon name="copy" size={12} />
            </button>
          </div>
        );
      },
    },
    {
      key: "remarks",
      header: "Remarks",
      minWidth: 150,
      render: (row) => row.remarks || "—",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20 text-center",
      minWidth: 80,
      render: (row) => (
        <div className="flex items-center justify-center">
          <button
            type="button"
            title="Print Receipt"
            onClick={() => {
              window.open(`/fees/receipt/${row.id}/print`, "_blank");
            }}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-teal-600 transition-all cursor-pointer flex items-center justify-center"
          >
            <Icon name="print" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-md border border-outline-variant bg-surface overflow-hidden">
      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(row) => row.id}
        emptyIcon="receipt_long"
        emptyMessage="No payments recorded yet"
        paginationPageSize={5}
      />
    </div>
  );
}
