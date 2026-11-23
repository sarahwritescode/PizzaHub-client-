"use client";

import Link from "next/link";
import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockedBadge, RoleBadge, TransactionStatusBadge } from "@/components/admin/badges";
import { ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
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

// One colour per status, shared with the vendor charts.
const STATUS_COLOR = {
  pending: "#d97706",
  approved: "#16a34a",
  accepted: "#16a34a",
  inactive: "#78716c",
  cancelled: "#78716c",
  rejected: "#d93015",
} as const;

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
    {
      label: "Users",
      value: data.users.total,
      hint: `${data.users.customers} customers · ${data.users.vendors} vendors · ${data.users.admins} admins`,
      href: "/dashboard/admin/users",
    },
    {
      label: "Blocked users",
      value: data.users.blocked,
      href: "/dashboard/admin/users?status=blocked",
    },
    {
      label: "Menu items awaiting review",
      value: data.menuItems.pending,
      hint: `${data.menuItems.total} items in total`,
      href: "/dashboard/admin/menu?status=pending",
    },
    { label: "Orders", value: data.orders.total, hint: `${data.orders.pending} pending` },
    {
      label: "Transactions",
      value: data.transactions.total,
      hint: `${data.transactions.success} successful`,
      href: "/dashboard/admin/transactions",
    },
    { label: "Active Premium vendors", value: data.subscriptions.activePremiumVendors },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const body = (
            <>
              <p className="text-sm font-medium text-ink/65">{card.label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-ink tabular-nums">{card.value}</p>
              {card.hint && <p className="mt-1 text-xs text-ink/55">{card.hint}</p>}
            </>
          );
          const base = "rounded-2xl border border-crust bg-white p-5";
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
        <RecentList title="Newest users" href="/dashboard/admin/users" empty="No users yet.">
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

        <RecentList title="Latest payments" href="/dashboard/admin/transactions" empty="No transactions yet.">
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

const sum = (counts: Record<string, number>, keys: readonly string[]) =>
  keys.reduce((total, key) => total + (counts[key] ?? 0), 0);

function StatusChart<S extends string>({
  title,
  labels,
  order,
  counts,
  noun,
}: {
  title: string;
  labels: Record<S, string>;
  order: readonly S[];
  counts: Record<S, number>;
  noun: string;
}) {
  const data = order.map((status) => ({
    status,
    label: labels[status],
    count: counts[status] ?? 0,
    fill: STATUS_COLOR[status as keyof typeof STATUS_COLOR],
  }));
  const config: ChartConfig = { count: { label: noun } };

  return (
    <section className="rounded-2xl border border-crust bg-white p-5" aria-label={title}>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {sum(counts, order) === 0 ? (
        <p className="py-16 text-center text-sm text-ink/60">No {noun} yet.</p>
      ) : (
        <ChartContainer config={config} className="mt-4 h-56 w-full">
          <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
            <Bar dataKey="count" radius={6}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </section>
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
    <section className="rounded-2xl border border-crust bg-white p-5" aria-label={title}>
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
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
