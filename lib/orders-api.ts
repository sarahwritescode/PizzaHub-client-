/**
 * Customer orders, as documented by the server (docs/CUSTOMER_ORDERS_TESTING.md):
 *   POST /api/orders   { itemId, deliveryDate: "YYYY-MM-DD", deliveryAddress, message? }
 * One menu item per order. Customer login required.
 *
 * The browser calls this site's own /api/orders (next.config.ts rewrites it to
 * the backend), so the first-party session cookie is sent automatically, the
 * same way /api/auth works.
 */

export type PlaceOrderInput = {
  itemId: string;
  /** YYYY-MM-DD, today (UTC) or later. */
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
};

export type PlaceOrderResult =
  | { ok: true }
  | { ok: false; message: string; code?: string; status?: number };

/** Longest values the server accepts. */
export const ADDRESS_MAX = 300;
export const MESSAGE_MAX = 500;

/** Today as YYYY-MM-DD in UTC, which is how the server decides "not in the past". */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return { ok: true };

    const body = await response.json().catch(() => null);
    return {
      ok: false,
      status: response.status,
      code: typeof body?.code === "string" ? body.code : undefined,
      message:
        response.status === 401
          ? "Your session has expired. Please sign in again."
          : (body?.errors?.[0]?.message ?? body?.message ?? `The server responded with ${response.status}.`),
    };
  } catch {
    return { ok: false, message: "We could not reach the server." };
  }
}
