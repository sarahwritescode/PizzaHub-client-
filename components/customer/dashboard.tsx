"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { brandButtonClass } from "@/components/shared/button-styles";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { StatusChart } from "@/components/shared/status-chart";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Thumb } from "@/components/shared/thumb";
import { useApiResource } from "@/hooks/use-api-resource";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { formatMenuPrice } from "@/lib/menu-api";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/api/types";
import { listAllMyOrders, vendorName } from "@/lib/orders-api";

const RECENT = 5;

export function CustomerDashboard() {
  const { data: session } = authClient.useSession();
  const { result, loading, reload } = useApiResource("customer-dashboard", () => listAllMyOrders());

  const firstName = session?.user.name?.split(" ")[0];

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Here is where your orders stand."
        actions={
          <Link href="/menu" className={brandButtonClass}>
            Browse menu <ArrowRightIcon aria-hidden="true" />
          </Link>
        }
      />

      {!result && loading && <DashboardSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className="space-y-6">
          <Stats orders={result.data.orders} total={result.data.total} />
          <section className="rounded-2xl border border-crust bg-surface p-5" aria-label="Recent orders">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink">Recent orders</h2>
              {result.data.total > 0 && (
                <Link href="/customer/orders" className="text-sm font-semibold text-tomato hover:underline">
                  View all
                </Link>
              )}
            </div>
            {result.data.orders.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No orders yet"
                  description="Pick a pizza from the menu and your orders will show up here."
                  action={
                    <Link href="/menu" className={brandButtonClass}>
                      Browse menu
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-crust">
                {result.data.orders.slice(0, RECENT).map((order) => (
                  <li key={order._id}>
                    <Link
                      href={`/customer/orders/${order._id}`}
                      className="flex items-center gap-3 rounded-lg py-3 outline-none transition-colors hover:bg-page/70 focus-visible:ring-2 focus-visible:ring-tomato"
                    >
                      <Thumb src={order.item?.images[0]} alt={order.item?.itemName ?? "Item"} className="size-12" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {order.item?.itemName ?? "Item no longer available"}
                        </p>
                        <p className="truncate text-xs text-ink/60">
                          {vendorName(order)} · deliver {formatDate(order.deliveryDate)}
                          {order.item ? ` · ${formatMenuPrice(order.item.price)}` : ""}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function Stats({ orders, total }: { orders: { status: string }[]; total: number }) {
  const count = (status: string) => orders.filter((order) => order.status === status).length;
  // With more than 500 orders only the newest are read; the total stays exact.
  const partial = orders.length < total;
  const cards = [
    { label: "Total orders", value: total },
    { label: "Pending orders", value: count("pending"), hint: "Waiting for the vendor" },
    { label: "Accepted orders", value: count("accepted"), hint: "On their way to you" },
    { label: "Rejected orders", value: count("rejected"), hint: "The vendor could not take them" },
  ];
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, count(status)])) as Record<
    (typeof ORDER_STATUSES)[number],
    number
  >;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-crust bg-surface p-5">
            <p className="text-sm font-medium text-ink/65">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink tabular-nums">{card.value}</p>
            {card.hint && <p className="mt-1 text-xs text-ink/55">{card.hint}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <StatusChart title="Your orders by status" labels={ORDER_STATUS_LABEL} order={ORDER_STATUSES} counts={byStatus} noun="orders" />
      </div>
      {partial && (
        <p className="mt-2 text-xs text-ink/55">Pending and accepted counts cover your {orders.length} newest orders.</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
