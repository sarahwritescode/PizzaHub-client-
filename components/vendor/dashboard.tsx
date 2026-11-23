"use client";

import Link from "next/link";
import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts";
import { CrownIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, OrderStatusBadge, PageHeader, Thumb } from "@/components/vendor/shared";
import { useApiResource } from "@/hooks/use-api-resource";
import { useSubscription } from "@/hooks/use-subscription";
import { formatMenuPrice } from "@/lib/menu-api";
import {
  FREE_PLAN_ACTIVE_LIMIT,
  MENU_STATUS_LABEL,
  MENU_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  countMenuItems,
  countOrders,
  formatDate,
  listOrders,
  type ApiResult,
  type Plan,
  type MenuStatus,
  type OrderStatus,
  type VendorOrder,
} from "@/lib/vendor-api";

type Stats = {
  menu: Record<MenuStatus, number>;
  orders: Record<OrderStatus, number>;
  recent: VendorOrder[];
};

const RECENT_ORDERS = 5;

async function loadStats(): Promise<ApiResult<Stats>> {
  const [menu, orders, recent] = await Promise.all([
    countMenuItems(),
    countOrders(),
    listOrders({ limit: RECENT_ORDERS }),
  ]);
  if (!menu.ok) return menu;
  if (!orders.ok) return orders;
  if (!recent.ok) return recent;
  return { ok: true, data: { menu: menu.data, orders: orders.data, recent: recent.data }, message: "" };
}

const sum = (counts: Record<string, number>) => Object.values(counts).reduce((total, n) => total + n, 0);

// One colour per status, shared by the badges and the charts.
const STATUS_COLOR = {
  pending: "#d97706",
  approved: "#16a34a",
  accepted: "#16a34a",
  inactive: "#78716c",
  cancelled: "#78716c",
  rejected: "#d93015",
} as const;

export function VendorDashboard() {
  const { result, loading, reload } = useApiResource("dashboard", loadStats);

  const { plan } = useSubscription();

  return (
    <>
      <PageHeader title="Dashboard" description="A live summary of your menu and orders." />

      {!result && loading && <DashboardSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}
      {result?.ok && (
        <div className="space-y-6">
          <StatGrid stats={result.data} plan={plan} />
          <div className="grid gap-6 lg:grid-cols-2">
            <StatusChart
              title="Menu items by status"
              labels={MENU_STATUS_LABEL}
              order={MENU_STATUSES}
              counts={result.data.menu}
              noun="menu items"
            />
            <StatusChart
              title="Orders by status"
              labels={ORDER_STATUS_LABEL}
              order={ORDER_STATUSES}
              counts={result.data.orders}
              noun="orders"
            />
          </div>
          <RecentOrders orders={result.data.recent} />
        </div>
      )}
    </>
  );
}

function StatGrid({ stats, plan }: { stats: Stats; plan: Plan | null }) {
  const active = stats.menu.pending + stats.menu.approved;
  const cards: { label: string; value: number; hint?: string }[] = [
    { label: "Total menu items", value: sum(stats.menu) },
    { label: "Active menu items", value: active, hint: "Pending + approved. These count toward your plan limit." },
    { label: "Pending approval", value: stats.menu.pending },
    { label: "Total orders", value: sum(stats.orders) },
    { label: "Pending orders", value: stats.orders.pending },
    { label: "Accepted orders", value: stats.orders.accepted },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-crust bg-white p-5">
          <p className="text-sm font-medium text-ink/65">{card.label}</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-ink tabular-nums">{card.value}</p>
          {card.hint && <p className="mt-1 text-xs text-ink/55">{card.hint}</p>}
        </div>
      ))}
      <div className="rounded-2xl border border-crust bg-white p-5">
        <p className="text-sm font-medium text-ink/65">Plan</p>
        {plan ? (
          <>
            <p className="mt-2 flex items-center gap-2 font-display text-3xl font-extrabold text-ink">
              {plan.isPremium && <CrownIcon aria-hidden="true" className="size-6 text-amber-500" />}
              {plan.isPremium ? "Premium" : "Free"}
            </p>
            <p className="mt-1 text-xs text-ink/55">
              {plan.isPremium
                ? `Unlimited active items${plan.expiresAt ? ` until ${formatDate(plan.expiresAt.toISOString())}` : ""}.`
                : `${active} of ${FREE_PLAN_ACTIVE_LIMIT} active items used.`}{" "}
              <Link href="/vendor/subscription" className="font-semibold text-tomato hover:underline">
                Details
              </Link>
            </p>
          </>
        ) : (
          <Skeleton className="mt-2 h-9 w-24" />
        )}
      </div>
    </div>
  );
}

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
    count: counts[status],
    fill: STATUS_COLOR[status as keyof typeof STATUS_COLOR],
  }));
  const config: ChartConfig = { count: { label: noun } };

  return (
    <section className="rounded-2xl border border-crust bg-white p-5" aria-label={title}>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {sum(counts) === 0 ? (
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

function RecentOrders({ orders }: { orders: VendorOrder[] }) {
  return (
    <section className="rounded-2xl border border-crust bg-white p-5" aria-label="Recent orders">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink">Recent orders</h2>
        <Link href="/vendor/orders" className="text-sm font-semibold text-tomato hover:underline">
          View all
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/60">No orders yet. They will show up here.</p>
      ) : (
        <ul className="mt-4 divide-y divide-crust">
          {orders.map((order) => (
            <li key={order._id} className="flex items-center gap-3 py-3">
              <Thumb src={order.item?.images[0]} alt={order.item?.itemName ?? "Item"} className="size-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {order.item?.itemName ?? "Item no longer available"}
                </p>
                <p className="truncate text-xs text-ink/60">
                  {order.customer?.name ?? "Unknown customer"} · deliver {formatDate(order.deliveryDate)}
                  {order.item ? ` · ${formatMenuPrice(order.item.price)}` : ""}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => (
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
