/**
 * Customer orders, as documented by the server (docs/CUSTOMER_ORDERS_TESTING.md):
 *   POST  /api/orders              { itemId, deliveryDate: "YYYY-MM-DD", deliveryAddress, message? }
 *   GET   /api/orders/my-orders    ?page&limit   (no status filter exists)
 *   GET   /api/orders/:id
 *   PATCH /api/orders/:id/cancel   (pending orders only)
 * One menu item per order, no quantity. Customer login required.
 *
 * The browser calls this site's own /api/orders (next.config.ts rewrites it to
 * the backend), so the first-party session cookie is sent automatically, the
 * same way /api/auth works.
 */
import { request, query, type ApiResult } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/api/types";

export type PlaceOrderInput = {
  itemId: string;
  /** YYYY-MM-DD, today (UTC) or later. */
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
};

export type CustomerOrder = {
  _id: string;
  itemId: string;
  /** The chosen day at 00:00 UTC. Show it as a date, never a time. */
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  status: OrderStatus;
  createdAt: string;
  /** null when the item no longer exists. */
  item: {
    _id: string;
    itemName: string;
    category: string;
    price: number;
    location: string;
    images: string[];
  } | null;
  /** null when the vendor account no longer exists. */
  vendor: { _id: string; name: string; businessName?: string } | null;
};

/** Longest values the server accepts. */
export const ADDRESS_MAX = 300;
export const MESSAGE_MAX = 500;

/** Today as YYYY-MM-DD in UTC, which is how the server decides "not in the past". */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function vendorName(order: Pick<CustomerOrder, "vendor">): string {
  return order.vendor?.businessName || order.vendor?.name || "Vendor unavailable";
}

export function placeOrder(input: PlaceOrderInput): Promise<ApiResult<CustomerOrder>> {
  return request<CustomerOrder>("/api/orders", { method: "POST", body: JSON.stringify(input) });
}

export function listMyOrders(params: { page?: number; limit?: number } = {}) {
  return request<CustomerOrder[]>(`/api/orders/my-orders${query(params)}`);
}

export function getOrder(id: string) {
  return request<CustomerOrder>(`/api/orders/${id}`);
}

export function cancelOrder(id: string) {
  return request<CustomerOrder>(`/api/orders/${id}/cancel`, { method: "PATCH" });
}

/**
 * The backend has no statistics endpoint and the list has no status filter, so
 * the dashboard reads the order list once (50 is the server's page maximum) and
 * only fetches further pages when the customer has more than 50 orders.
 */
export async function listAllMyOrders(maxPages = 10): Promise<ApiResult<{ orders: CustomerOrder[]; total: number }>> {
  const orders: CustomerOrder[] = [];
  let total = 0;
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await listMyOrders({ page, limit: 50 });
    if (!result.ok) return result;
    orders.push(...result.data);
    total = result.pagination?.totalItems ?? orders.length;
    if (!result.pagination?.hasNextPage) break;
  }
  return { ok: true, data: { orders, total }, message: "" };
}

/** Friendly text for the backend's order error codes (docs section A). */
export function orderErrorMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case "DUPLICATE_ORDER":
      return "You already have an active order for this item on that delivery date. Pick another day, or cancel the existing order first.";
    case "CANNOT_ORDER_OWN_ITEM":
      return "You cannot order your own menu item.";
    case "MENU_ITEM_UNAVAILABLE":
      return "This item is not available to order right now.";
    case "MENU_ITEM_NOT_FOUND":
      return "This item no longer exists.";
    case "FORBIDDEN":
      return "Only customer accounts can place orders.";
    case "ACCOUNT_BLOCKED":
      return "Your account is blocked, so you cannot place orders.";
    default:
      return fallback;
  }
}
