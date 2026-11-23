"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarDaysIcon, MapPinIcon, MessageSquareIcon, StoreIcon, XIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { OrderTimeline } from "@/components/customer/order-timeline";
import { brandButtonClass, dangerButtonClass } from "@/components/shared/button-styles";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Thumb } from "@/components/shared/thumb";
import { useApiResource } from "@/hooks/use-api-resource";
import { formatDate } from "@/lib/format";
import { formatMenuPrice } from "@/lib/menu-api";
import { cancelOrder, getOrder, vendorName, type CustomerOrder } from "@/lib/orders-api";

export function OrderDetails({ id }: { id: string }) {
  const { result, loading, reload } = useApiResource(`order:${id}`, () => getOrder(id));
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function confirmCancel() {
    setCancelling(true);
    const response = await cancelOrder(id);
    setCancelling(false);
    setConfirming(false);

    if (response.ok) {
      toast.add({ type: "success", title: "Order cancelled", description: "The vendor will no longer see it as active." });
    } else {
      // 409 INVALID_STATUS_TRANSITION (the vendor answered first), 404 (gone), 403 (not allowed):
      // the server's message says why.
      toast.add({ type: "error", title: "Could not cancel the order", description: response.message });
    }
    // Refresh either way so the page shows the order's real current status.
    reload();
  }

  const back = (
    <Link
      href="/customer/orders"
      className="mb-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-ink/65 outline-none transition-colors hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-4" /> My orders
    </Link>
  );

  if (!result && loading) {
    return (
      <>
        {back}
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Loading order">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </>
    );
  }

  if (result && !result.ok) {
    // 400/404 both mean "no such order of yours" (the server answers 404 for other customers' orders too).
    if (result.status === 404 || result.status === 400) {
      return (
        <>
          {back}
          <EmptyState
            title="Order not found"
            description="This order does not exist, or it is not one of yours."
            action={
              <Link href="/customer/orders" className={brandButtonClass}>
                Back to my orders
              </Link>
            }
          />
        </>
      );
    }
    return (
      <>
        {back}
        <ErrorState message={result.message} onRetry={reload} />
      </>
    );
  }
  if (!result) return null;

  const order = result.data;

  return (
    <>
      {back}
      <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {order.item?.itemName ?? "Item no longer available"}
            </h1>
            <p className="mt-1 text-sm text-ink/65">Order …{order._id.slice(-8)} · placed {formatDate(order.createdAt, true)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ItemCard order={order} />
            <section className="rounded-2xl border border-crust bg-white p-5" aria-label="Delivery">
              <h2 className="font-display text-lg font-bold text-ink">Delivery</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <Detail icon={<CalendarDaysIcon aria-hidden="true" />} label="Delivery date">
                  {formatDate(order.deliveryDate)}
                </Detail>
                <Detail icon={<MapPinIcon aria-hidden="true" />} label="Delivery address">
                  {order.deliveryAddress}
                </Detail>
                <Detail icon={<StoreIcon aria-hidden="true" />} label="Vendor">
                  {vendorName(order)}
                </Detail>
                {order.message && (
                  <Detail icon={<MessageSquareIcon aria-hidden="true" />} label="Your message">
                    {order.message}
                  </Detail>
                )}
              </dl>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-crust bg-white p-5" aria-label="Order status">
              <h2 className="font-display text-lg font-bold text-ink">Status</h2>
              <div className="mt-4">
                <OrderTimeline status={order.status} createdAt={order.createdAt} />
              </div>
              {/* Only a pending order can be cancelled (the server answers 409 otherwise). */}
              {order.status === "pending" && (
                <div className="mt-5 border-t border-crust pt-4">
                  <button type="button" onClick={() => setConfirming(true)} className={`${dangerButtonClass} w-full`}>
                    <XIcon aria-hidden="true" /> Cancel order
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={(open) => !open && !cancelling && setConfirming(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              {order.item?.itemName ?? "This order"} will be cancelled. This cannot be undone, but you can order again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep order</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel order"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ItemCard({ order }: { order: CustomerOrder }) {
  const { item } = order;
  return (
    <section className="rounded-2xl border border-crust bg-white p-5" aria-label="Item">
      <h2 className="font-display text-lg font-bold text-ink">Item</h2>
      {item ? (
        <div className="mt-4 flex gap-4">
          <Thumb src={item.images[0]} alt={item.itemName} className="size-24" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{item.itemName}</p>
            <p className="mt-0.5 text-sm text-ink/65">
              {item.category} · {item.location}
            </p>
            <p className="mt-1 font-display text-xl font-bold text-tomato">{formatMenuPrice(item.price)}</p>
            <p className="text-xs text-ink/55">1 item</p>
            <Link
              href={`/menu/${item._id}`}
              className="mt-2 inline-block text-sm font-semibold text-tomato outline-none hover:underline focus-visible:ring-2 focus-visible:ring-tomato"
            >
              View on menu
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink/65">This item has been removed from the menu.</p>
      )}
    </section>
  );
}

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink/45 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-ink/55">{label}</dt>
        <dd className="break-words text-ink">{children}</dd>
      </div>
    </div>
  );
}
