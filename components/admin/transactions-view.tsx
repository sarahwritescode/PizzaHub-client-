"use client";

import { useState } from "react";
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
  type AdminTransaction,
  type TransactionStatus,
} from "@/lib/admin-api";

const PAGE_SIZE = 12;

export function TransactionsView() {
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [page, setPage] = useState(1);

  const { result, loading, reload } = useApiResource(`admin-transactions:${status}:${page}`, () =>
    listTransactions({ status: status || undefined, page, limit: PAGE_SIZE })
  );

  const transactions = result?.ok ? result.data : [];
  const pagination = result?.ok ? result.pagination : undefined;

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Vendor subscription payments. This list is read-only; it changes only when Stripe confirms a payment."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
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
          <option value="">All transactions</option>
          {TRANSACTION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {TRANSACTION_STATUS_LABEL[value]}
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
              title={status ? `No ${TRANSACTION_STATUS_LABEL[status].toLowerCase()} transactions` : "No transactions yet"}
              description={status ? "Try another status." : "Premium subscription payments will appear here."}
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
