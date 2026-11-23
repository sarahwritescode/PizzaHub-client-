"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockedBadge, RoleBadge, TransactionStatusBadge } from "@/components/admin/badges";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusChart } from "@/components/shared/status-chart";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { useApiResource } from "@/hooks/use-api-resource";
import {
  MENU_STATUS_LABEL,
  MENU_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  formatDate,
  formatMoney,
  getDashboard,
  type AdminDashboard as DashboardData,
} from "@/lib/admin-api";

export function AdminDashboard() {
  const { result, loading, reload } = useApiResource("admin-dashboard", getDashboard);

  return (
    <>
      <PageHeader title="Overview" description="Live totals across users, menu items, orders and subscriptions." />

      {!result && loading && <DashboardSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}
      {result?.ok && <DashboardBody data={result.data} />}
    </>
  );
}

function DashboardBody({ data }: { data: DashboardData }) {
  const cards: { label: string; value: number; hint?: string; href?: string }[] = [
    { label: "Total users", value: data.users.total, hint: `${data.users.admins} admin${data.users.admins === 1 ? "" : "s"}`, href: "/admin/users" },
    { label: "Customers", value: data.users.customers, href: "/admin/users?role=customer" },
    { label: "Vendors", value: data.users.vendors, href: "/admin/users?role=vendor" },
    { label: "Blocked users", value: data.users.blocked, href: "/admin/users?status=blocked" },
    { label: "Total menu items", value: data.menuItems.total, href: "/admin/menu-items" },
    {
      label: "Pending menu items",
      value: data.menuItems.pending,
      hint: "Waiting for your review",
      href: "/admin/menu-items?status=pending",
    },
    { label: "Approved menu items", value: data.menuItems.approved, hint: "Live on the public menu", href: "/admin/menu-items?status=approved" },
    { label: "Total orders", value: data.orders.total },
    { label: "Pending orders", value: data.orders.pending, hint: "Waiting for the vendor" },
    {
      label: "Successful transactions",
      value: data.transactions.success,
      hint: `${data.transactions.total} in total`,
      href: "/admin/transactions?status=success",
    },
    { label: "Active Premium vendors", value: data.subscriptions.activePremiumVendors },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const body = (
            <>
              <p className="text-sm font-medium text-ink/65">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-ink tabular-nums">{card.value}</p>
              {card.hint && <p className="mt-1 text-xs text-ink/55">{card.hint}</p>}
            </>
          );
          const base = "rounded-2xl border border-crust bg-surface p-5";
          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className={`${base} outline-none transition-colors hover:border-tomato/50 focus-visible:ring-2 focus-visible:ring-tomato`}
            >
              {body}
            </Link>
          ) : (
            <div key={card.label} className={base}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart
          title="Menu items by status"
          labels={MENU_STATUS_LABEL}
          order={MENU_STATUSES}
          counts={data.menuItems}
          noun="menu items"
        />
        <StatusChart
          title="Orders by status"
          labels={ORDER_STATUS_LABEL}
          order={ORDER_STATUSES}
          counts={data.orders}
          noun="orders"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentList title="Newest users" href="/admin/users" empty="No users yet.">
          {data.recent.users.map((user) => (
            <li key={user._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink/60">{user.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {user.isBlocked && <BlockedBadge />}
                <RoleBadge role={user.role} />
              </div>
            </li>
          ))}
        </RecentList>

        <RecentList title="Latest orders" empty="No orders yet.">
          {data.recent.orders.map((order) => (
            <li key={order._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">Order …{order._id.slice(-6)}</p>
                <p className="truncate text-xs text-ink/60">
                  Deliver {formatDate(order.deliveryDate)} · placed {formatDate(order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </li>
          ))}
        </RecentList>

        <RecentList title="Latest payments" href="/admin/transactions" empty="No transactions yet.">
          {data.recent.transactions.map((transaction) => (
            <li key={transaction._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {formatMoney(transaction.amount, transaction.currency)}
                </p>
                <p className="truncate text-xs text-ink/60">
                  {transaction.vendor?.name ?? "Deleted vendor"} · {formatDate(transaction.createdAt)}
                </p>
              </div>
              <TransactionStatusBadge status={transaction.status} />
            </li>
          ))}
        </RecentList>
      </div>
    </div>
  );
}

function RecentList({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href?: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-crust bg-surface p-5" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-tomato hover:underline">
            View all
          </Link>
        )}
      </div>
      {children.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/60">{empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-crust">{children}</ul>
      )}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading overview">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 11 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
