/**
 * Client for the vendor-only backend endpoints (server docs:
 * VENDOR_MENU_TESTING.md, IMAGE_UPLOAD_TESTING.md, VENDOR_ORDERS_TESTING.md):
 *
 *   GET    /api/vendor/menu-items?status&page&limit
 *   POST   /api/vendor/menu-items
 *   PATCH  /api/vendor/menu-items/:id
 *   PATCH  /api/vendor/menu-items/:id/availability   { isActive }
 *   DELETE /api/vendor/menu-items/:id
 *   POST   /api/vendor/upload-image                  multipart, field "images"
 *   GET    /api/vendor/orders?status&page&limit
 *   PATCH  /api/vendor/orders/:id/accept | /reject
 *
 * The browser calls this site's own /api/vendor/* (next.config.ts rewrites it
 * to the backend), so the first-party session cookie authenticates every call,
 * exactly like /api/orders. The ImgBB key only ever lives on the backend.
 */
import type { Pagination } from "@/lib/menu-api";

export type { Pagination };

/* ------------------------------------------------------------------ types */

export const MENU_STATUSES = ["pending", "approved", "inactive", "rejected"] as const;
export type MenuStatus = (typeof MENU_STATUSES)[number];

export const ORDER_STATUSES = ["pending", "accepted", "rejected", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type VendorMenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: MenuStatus;
  createdAt: string;
};

/** The six fields a vendor may write. Anything else is a 400 on the server. */
export type MenuItemInput = {
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
};

export type VendorOrder = {
  _id: string;
  itemId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  status: OrderStatus;
  createdAt: string;
  item: {
    _id: string;
    itemName: string;
    category: string;
    price: number;
    location: string;
    images: string[];
  } | null;
  customer: { _id: string; name: string } | null;
};

/** Limits the server enforces (VENDOR_MENU_TESTING.md). */
export const LIMITS = {
  itemName: 100,
  category: 50,
  description: 1000,
  location: 100,
  maxPrice: 1_000_000,
  maxImages: 10,
} as const;

/** The Free plan allows this many active (pending or approved) items. */
export const FREE_PLAN_ACTIVE_LIMIT = 3;

/* --------------------------------------------------------------- requests */

export type FieldError = { field: string; message: string };

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  message: string;
  pagination?: Pagination;
};

export type ApiFailure = {
  ok: false;
  /** 0 when the server could not be reached. */
  status: number;
  code?: string;
  message: string;
  errors?: FieldError[];
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

function failureFrom(status: number, body: unknown): ApiFailure {
  const parsed = (body ?? {}) as {
    message?: unknown;
    code?: unknown;
    errors?: unknown;
  };
  const errors = Array.isArray(parsed.errors)
    ? (parsed.errors as FieldError[]).filter(
        (entry) => typeof entry?.field === "string" && typeof entry?.message === "string"
      )
    : undefined;
  const code = typeof parsed.code === "string" ? parsed.code : undefined;

  let message: string;
  if (status === 401) message = "Your session has expired. Please sign in again.";
  else if (typeof parsed.message === "string" && parsed.message) message = parsed.message;
  else message = `The server responded with ${status}.`;

  // A validation failure is more useful with the first field message.
  if (code === "VALIDATION_ERROR" && errors?.length) {
    message = errors.map((entry) => entry.message).join(" ");
  }
  return { ok: false, status, code, message, errors };
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.success === false) return failureFrom(response.status, body);
    return {
      ok: true,
      data: body?.data as T,
      message: typeof body?.message === "string" ? body.message : "",
      pagination: body?.pagination,
    };
  } catch {
    return { ok: false, status: 0, message: "We could not reach the server. Check your connection." };
  }
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/* ------------------------------------------------------------- menu items */

export function listMenuItems(params: { status?: MenuStatus; page?: number; limit?: number } = {}) {
  return request<VendorMenuItem[]>(`/api/vendor/menu-items${query(params)}`);
}

export function createMenuItem(input: MenuItemInput) {
  return request<VendorMenuItem>("/api/vendor/menu-items", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateMenuItem(id: string, input: Partial<MenuItemInput>) {
  return request<VendorMenuItem>(`/api/vendor/menu-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setMenuItemAvailability(id: string, isActive: boolean) {
  return request<VendorMenuItem>(`/api/vendor/menu-items/${id}/availability`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function deleteMenuItem(id: string) {
  return request<{ _id: string }>(`/api/vendor/menu-items/${id}`, { method: "DELETE" });
}

/**
 * The backend has no "get one of my items" endpoint (the public one only
 * returns approved items), so the edit page looks the item up in the vendor's
 * own list, 50 at a time (the server's maximum page size).
 */
export async function findMenuItem(id: string): Promise<ApiResult<VendorMenuItem | null>> {
  let page = 1;
  for (;;) {
    const result = await listMenuItems({ page, limit: 50 });
    if (!result.ok) return result;
    const match = result.data.find((item) => item._id === id);
    if (match) return { ok: true, data: match, message: result.message };
    if (!result.pagination?.hasNextPage) return { ok: true, data: null, message: result.message };
    page += 1;
  }
}

/* ----------------------------------------------------------------- orders */

export function listOrders(params: { status?: OrderStatus; page?: number; limit?: number } = {}) {
  return request<VendorOrder[]>(`/api/vendor/orders${query(params)}`);
}

export function acceptOrder(id: string) {
  return request<VendorOrder>(`/api/vendor/orders/${id}/accept`, { method: "PATCH" });
}

export function rejectOrder(id: string) {
  return request<VendorOrder>(`/api/vendor/orders/${id}/reject`, { method: "PATCH" });
}

/* ---------------------------------------------------------- image uploads */

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

/** Checks the first bytes, like the server does ("renamed .txt" files fail). */
async function looksLikeSupportedImage(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  const jpeg = startsWith(0xff, 0xd8, 0xff);
  const png = startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  const webp = startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  return jpeg || png || webp;
}

/** Returns an error message, or null when the file can be uploaded. */
export async function validateImageFile(file: File): Promise<string | null> {
  if (file.size === 0) return "This file is empty.";
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Only JPEG, PNG or WEBP images are supported.";
  }
  if (file.size > IMAGE_MAX_BYTES) return "Images must be 5 MB or smaller.";
  if (!(await looksLikeSupportedImage(file))) {
    return "This file is not a valid JPEG, PNG or WEBP image.";
  }
  return null;
}

/**
 * Uploads ONE image through the backend's ImgBB endpoint and reports progress.
 * (fetch cannot report upload progress, so this uses XMLHttpRequest.) One image
 * per request also keeps every request under Vercel's ~4.5 MB body limit
 * whenever the picture is small enough, and lets a failed file be retried alone.
 */
export function uploadImage(
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal
): Promise<ApiResult<{ url: string }>> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/vendor/upload-image");
    xhr.responseType = "json";
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const body = xhr.response as {
        success?: boolean;
        data?: { images?: { url?: string }[] };
      } | null;
      const url = body?.data?.images?.[0]?.url;
      if (xhr.status >= 200 && xhr.status < 300 && body?.success !== false && url) {
        onProgress(100);
        resolve({ ok: true, data: { url }, message: "" });
        return;
      }
      if (xhr.status === 413) {
        resolve({
          ok: false,
          status: 413,
          code: "FILE_TOO_LARGE",
          message: "This image is too large for the server. Try a smaller file.",
        });
        return;
      }
      resolve(failureFrom(xhr.status, body));
    };
    xhr.onerror = () =>
      resolve({ ok: false, status: 0, message: "We could not reach the server. Check your connection." });
    xhr.onabort = () => resolve({ ok: false, status: 0, code: "ABORTED", message: "Upload cancelled." });
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    const form = new FormData();
    form.append("images", file);
    xhr.send(form);
  });
}

/* ------------------------------------------------------------ subscription */

export type Plan = {
  isPremium: boolean;
  /** Set only while Premium is in force. */
  expiresAt: Date | null;
  /** The plan stored on the account (may say premium even if it has lapsed). */
  storedPlan: "free" | "premium";
};

/**
 * Mirrors the server's rule: Premium means plan = "premium" AND an expiry in
 * the future. This is for display only; the backend decides on every request.
 */
export function resolvePlan(user: {
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: Date | string | null;
}): Plan {
  const storedPlan = user.subscriptionPlan === "premium" ? "premium" : "free";
  const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  const valid = expiresAt !== null && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > Date.now();
  return { isPremium: storedPlan === "premium" && valid, expiresAt: valid ? expiresAt : null, storedPlan };
}

/* ---------------------------------------------------------------- display */

export const MENU_STATUS_LABEL: Record<MenuStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  inactive: "Inactive",
  rejected: "Rejected",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/** Active items are the ones that count toward the Free plan limit. */
export function isActiveStatus(status: MenuStatus): boolean {
  return status === "pending" || status === "approved";
}

export function formatDate(value: string, withTime = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // Delivery dates are plain days stored at 00:00 UTC; show them in UTC so
    // they never slide to the previous day.
    timeZone: withTime ? undefined : "UTC",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

/* ------------------------------------------------------------------ stats */

/**
 * The backend has no statistics endpoint, so counts come from the list
 * endpoints: asking for one row per status and reading pagination.totalItems.
 */
async function countBy<S extends string>(
  statuses: readonly S[],
  list: (status: S) => Promise<ApiResult<unknown[]>>
): Promise<ApiResult<Record<S, number>>> {
  const results = await Promise.all(statuses.map((status) => list(status)));
  const counts = {} as Record<S, number>;
  for (const [index, result] of results.entries()) {
    if (!result.ok) return result;
    counts[statuses[index]] = result.pagination?.totalItems ?? 0;
  }
  return { ok: true, data: counts, message: "" };
}

export function countMenuItems() {
  return countBy(MENU_STATUSES, (status) => listMenuItems({ status, limit: 1 }));
}

export function countOrders() {
  return countBy(ORDER_STATUSES, (status) => listOrders({ status, limit: 1 }));
}

/** Items that count toward the Free plan limit (pending + approved). */
export async function countActiveMenuItems(): Promise<ApiResult<number>> {
  const counts = await countMenuItems();
  if (!counts.ok) return counts;
  return { ok: true, data: counts.data.pending + counts.data.approved, message: "" };
}
