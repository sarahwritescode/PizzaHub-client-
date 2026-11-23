"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDaysIcon, StoreIcon } from "lucide-react";
import { brandButtonClass, outlineButtonClass } from "@/components/shared/button-styles";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Pager } from "@/components/shared/pager";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Thumb } from "@/components/shared/thumb";
import { useApiResource } from "@/hooks/use-api-resource";
import { formatDate } from "@/lib/format";
import { formatMenuPrice } from "@/lib/menu-api";
import { listMyOrders, vendorName, type CustomerOrder } from "@/lib/orders-api";

const PAGE_SIZE = 12;

// The backend's list only supports page and limit (no status filter), so this
// page offers paging only.
export function OrdersList() {
  const [page, setPage] = useState(1);
  const { result, loading, reload } = useApiResource(`my-orders:${page}`, () =>
    listMyOrders({ page, limit: PAGE_SIZE })
  );

  const orders = result?.ok ? result.data : [];
  const pagination = result?.ok ? result.pagination : undefined;

  return (
    <>
      <PageHeader title="My orders" description="Every order you have placed, newest first." />

      {!result && loading && <ListSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {orders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Pick a pizza from the menu and your orders will show up here."
              action={
                <Link href="/menu" className={brandButtonClass}>
                  Browse menu
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </ul>
          )}
          {pagination && <Pager pagination={pagination} onPage={setPage} disabled={loading} />}
        </div>
      )}
    </>
  );
}

function OrderRow({ order }: { order: CustomerOrder }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-crust bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <Thumb src={order.item?.images[0]} alt={order.item?.itemName ?? "Item"} className="size-20" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-lg leading-tight font-bold text-ink">
              {order.item?.itemName ?? "Item no longer available"}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          {order.item && (
            <p className="mt-1 text-sm font-semibold text-tomato">{formatMenuPrice(order.item.price)}</p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/65">
            <StoreIcon aria-hidden="true" className="size-3.5" /> {vendorName(order)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/65">
            <CalendarDaysIcon aria-hidden="true" className="size-3.5" /> Deliver {formatDate(order.deliveryDate)} ·
            placed {formatDate(order.createdAt)}
          </p>
        </div>
      </div>
      <Link href={`/customer/orders/${order._id}`} className={`${outlineButtonClass} sm:self-center`}>
        Details
      </Link>
    </li>
  );
}
