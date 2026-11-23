"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionStatusBadge } from "@/components/admin/badges";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Pager } from "@/components/shared/pager";
import { useApiResource } from "@/hooks/use-api-resource";
import {
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_LABEL,
  formatDate,
  formatMoney,
  listTransactions,
  listVendors,
  type AdminTransaction,
  type TransactionStatus,
} from "@/lib/admin-api";

const PAGE_SIZE = 12;

export function TransactionsView() {
  // The overview links here with ?status=success.
  const initial = useSearchParams().get("status");
  const [status, setStatus] = useState<TransactionStatus | "">(
    (TRANSACTION_STATUSES as readonly string[]).includes(initial ?? "") ? (initial as TransactionStatus) : ""
  );
  const [vendorId, setVendorId] = useState("");
  const [page, setPage] = useState(1);

  const { result, loading, reload } = useApiResource(`admin-transactions:${status}:${vendorId}:${page}`, () =>
    listTransactions({ status: status || undefined, vendorId: vendorId || undefined, page, limit: PAGE_SIZE })
  );

  // Vendor filter options: every vendor account.
  const { result: vendorsResult } = useApiResource("admin-transaction-vendors", listVendors);
  const vendors = vendorsResult?.ok ? vendorsResult.data : [];

  const transactions = result?.ok ? result.data : [];
  const pagination = result?.ok ? result.pagination : undefined;

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Vendor subscription payments. This list is read-only; it changes only when Stripe confirms a payment."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label htmlFor="transaction-status" className="text-sm font-medium text-ink/70">
          Status
        </label>
        <select
          id="transaction-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as TransactionStatus | "");
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
        >
          <option value="">All statuses</option>
          {TRANSACTION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {TRANSACTION_STATUS_LABEL[value]}
            </option>
          ))}
        </select>
        <label htmlFor="transaction-vendor" className="text-sm font-medium text-ink/70">
          Vendor
        </label>
        <select
          id="transaction-vendor"
          value={vendorId}
          onChange={(event) => {
            setVendorId(event.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-64"
        >
          <option value="">All vendors</option>
          {vendors.map((vendor) => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.businessName ?? vendor.name} ({vendor.email})
            </option>
          ))}
        </select>
      </div>

      {!result && loading && <ListSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {transactions.length === 0 ? (
            <EmptyState
              title={status && !vendorId ? `No ${TRANSACTION_STATUS_LABEL[status].toLowerCase()} transactions` : status || vendorId ? "No matching transactions" : "No transactions yet"}
              description={status || vendorId ? "Try another status or vendor." : "Premium subscription payments will appear here."}
            />
          ) : (
            <ul className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction._id} transaction={transaction} />
              ))}
            </ul>
          )}
          {pagination && <Pager pagination={pagination} onPage={setPage} disabled={loading} />}
        </div>
      )}
    </>
  );
}

function TransactionRow({ transaction }: { transaction: AdminTransaction }) {
  const { vendor } = transaction;
  return (
    <li className="rounded-2xl border border-crust bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-ink tabular-nums">
            {formatMoney(transaction.amount, transaction.currency)}
            <span className="ml-2 text-sm font-medium text-ink/60 capitalize">{transaction.plan} plan</span>
          </p>
          <p className="mt-0.5 truncate text-sm text-ink/70">
            {vendor ? `${vendor.businessName ?? vendor.name} (${vendor.email})` : "Vendor account removed"}
          </p>
          <p className="mt-0.5 text-xs text-ink/55">{formatDate(transaction.createdAt, true)}</p>
        </div>
        <TransactionStatusBadge status={transaction.status} />
      </div>

      {(transaction.stripeSessionId || transaction.stripeSubscriptionId) && (
        <dl className="mt-3 grid gap-2 border-t border-crust pt-3 text-xs sm:grid-cols-2">
          {transaction.stripeSessionId && <Reference label="Stripe session" value={transaction.stripeSessionId} />}
          {transaction.stripeSubscriptionId && (
            <Reference label="Stripe subscription" value={transaction.stripeSubscriptionId} />
          )}
        </dl>
      )}
    </li>
  );
}

function Reference({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-medium text-ink/55">{label}</dt>
      <dd className="truncate font-mono text-ink/80" title={value}>
        {value}
      </dd>
    </div>
  );
}
