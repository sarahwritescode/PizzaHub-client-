"use client";

import { useState, type ReactNode } from "react";
import { CalendarDaysIcon, CheckIcon, MapPinIcon, MessageSquareIcon, UserRoundIcon, XIcon } from "lucide-react";
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
import { toast } from "@/components/ui/toast";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  OrderStatusBadge,
  PageHeader,
  Pager,
  Thumb,
  brandButtonClass,
  dangerButtonClass,
} from "@/components/vendor/shared";
import { useApiResource } from "@/hooks/use-api-resource";
import { formatMenuPrice } from "@/lib/menu-api";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  acceptOrder,
  formatDate,
  listOrders,
  rejectOrder,
  type OrderStatus,
  type VendorOrder,
} from "@/lib/vendor-api";

const PAGE_SIZE = 12;

type Decision = { order: VendorOrder; kind: "accept" | "reject" };

export function OrdersManager() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [working, setWorking] = useState(false);

  const { result, loading, reload } = useApiResource(`orders:${status}:${page}`, () =>
    listOrders({ status: status || undefined, page, limit: PAGE_SIZE })
  );

  async function confirmDecision() {
    if (!decision) return;
    const { order, kind } = decision;
    setWorking(true);
    const response = kind === "accept" ? await acceptOrder(order._id) : await rejectOrder(order._id);
    setWorking(false);
    setDecision(null);

    if (response.ok) {
      toast.add({
        type: "success",
        title: kind === "accept" ? "Order accepted" : "Order rejected",
        description: `${order.customer?.name ?? "The customer"}'s order for ${order.item?.itemName ?? "this item"}.`,
      });
    } else {
      // e.g. 409 INVALID_STATUS_TRANSITION when the customer cancelled first.
      toast.add({ type: "error", title: `Could not ${kind} the order`, description: response.message });
    }
    // Refresh either way so the list shows the order's real current status.
    reload();
  }

  const orders = result?.ok ? result.data : [];
  const pagination = result?.ok ? result.pagination : undefined;

  return (
    <>
      <PageHeader title="Orders" description="Orders placed for your menu items. Only pending orders can be accepted or rejected." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label htmlFor="order-status" className="text-sm font-medium text-ink/70">
          Status
        </label>
        <select
          id="order-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as OrderStatus | "");
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-input bg-surface px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
        >
          <option value="">All orders</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABEL[value]}
            </option>
          ))}
        </select>
      </div>

      {!result && loading && <ListSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {orders.length === 0 ? (
            <EmptyState
              title={status ? `No ${ORDER_STATUS_LABEL[status].toLowerCase()} orders` : "No orders yet"}
              description={
                status ? "Try another status." : "When customers order your items, they will appear here."
              }
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onDecide={(kind) => setDecision({ order, kind })}
                />
              ))}
            </ul>
          )}
          {pagination && <Pager pagination={pagination} onPage={setPage} disabled={loading} />}
        </div>
      )}

      <AlertDialog open={decision !== null} onOpenChange={(open) => !open && !working && setDecision(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{decision?.kind === "accept" ? "Accept this order?" : "Reject this order?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {decision?.kind === "accept"
                ? `You are agreeing to deliver ${decision.order.item?.itemName ?? "this item"} to ${decision.order.customer?.name ?? "the customer"} on ${formatDate(decision.order.deliveryDate)}.`
                : `${decision?.order.customer?.name ?? "The customer"} will see the order as rejected. This cannot be undone, but they can order again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Go back</AlertDialogCancel>
            <Button
              variant={decision?.kind === "reject" ? "destructive" : "default"}
              onClick={confirmDecision}
              disabled={working}
            >
              {working ? "Working..." : decision?.kind === "accept" ? "Accept order" : "Reject order"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function OrderCard({ order, onDecide }: { order: VendorOrder; onDecide: (kind: Decision["kind"]) => void }) {
  return (
    <li className="rounded-2xl border border-crust bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <Thumb src={order.item?.images[0]} alt={order.item?.itemName ?? "Item"} className="size-16" />
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg leading-tight font-bold text-ink">
              {order.item?.itemName ?? "Item no longer available"}
            </h2>
            {order.item && (
              <p className="text-sm text-ink/70">
                <span className="font-semibold text-tomato">{formatMenuPrice(order.item.price)}</span> ·{" "}
                {order.item.category} · 1 item
              </p>
            )}
            <p className="mt-0.5 text-xs text-ink/55">Ordered {formatDate(order.createdAt, true)}</p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail icon={<UserRoundIcon aria-hidden="true" />} label="Customer">
          {order.customer?.name ?? "Unknown customer"}
        </Detail>
        <Detail icon={<CalendarDaysIcon aria-hidden="true" />} label="Delivery date">
          {formatDate(order.deliveryDate)}
        </Detail>
        <Detail icon={<MapPinIcon aria-hidden="true" />} label="Delivery address">
          {order.deliveryAddress}
        </Detail>
        {order.message && (
          <Detail icon={<MessageSquareIcon aria-hidden="true" />} label="Message">
            {order.message}
          </Detail>
        )}
      </dl>

      {order.status === "pending" && (
        <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-crust pt-4">
          <button type="button" onClick={() => onDecide("reject")} className={dangerButtonClass}>
            <XIcon aria-hidden="true" /> Reject
          </button>
          <button type="button" onClick={() => onDecide("accept")} className={brandButtonClass}>
            <CheckIcon aria-hidden="true" /> Accept
          </button>
        </div>
      )}
    </li>
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
