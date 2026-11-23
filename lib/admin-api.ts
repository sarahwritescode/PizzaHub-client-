/**
 * Client for the admin-only backend endpoints (server docs: ADMIN_API_TESTING.md
 * and ADMIN_MENU_TESTING.md):
 *
 *   GET   /api/admin/dashboard
 *   GET   /api/admin/menu-items?status&category&search&page&limit
 *   GET   /api/admin/menu-items/categories          [{ name, count }]
 *   GET   /api/admin/vendors                        [{ _id, name, email, businessName }]
 *   PATCH /api/admin/menu-items/:id/approve | /reject
 *   PATCH /api/admin/menu-items/:id/status          { status }
 *   DELETE /api/admin/menu-items/:id
 *   GET   /api/admin/users?search&role&status&page&limit
 *   GET   /api/admin/users/:id
 *   PATCH /api/admin/users/:id/block | /unblock
 *   GET   /api/admin/transactions?status&vendorId&page&limit
 *
 * Like the vendor API, the browser calls this site's own /api/admin/*
 * (next.config.ts rewrites it to the backend), so the first-party session
 * cookie authenticates every call. Transactions are read-only by design.
 */
import { query, request } from "@/lib/api/client";
import type { MenuStatus, OrderStatus } from "@/lib/api/types";

export { MENU_STATUSES, MENU_STATUS_LABEL, ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/api/types";
export type { MenuStatus, OrderStatus, Pagination } from "@/lib/api/types";
export type { ApiFailure, ApiResult, ApiSuccess } from "@/lib/api/client";
export { formatDate } from "@/lib/format";

/* ------------------------------------------------------------------ types */

export const USER_ROLES = ["customer", "vendor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

export const USER_BLOCK_FILTERS = ["unblocked", "blocked"] as const;
export type UserBlockFilter = (typeof USER_BLOCK_FILTERS)[number];

export const TRANSACTION_STATUSES = ["success", "pending", "failed", "cancelled", "expired"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const TRANSACTION_STATUS_LABEL: Record<TransactionStatus, string> = {
  success: "Successful",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
  businessName: string | null;
  isBlocked: boolean;
  /** The effective plan: "premium" only while the paid period is in force. */
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  createdAt: string;
};

export type AdminMenuItem = {
  _id: string;
  vendorId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: MenuStatus;
  createdAt: string;
  /** null when the vendor's account no longer exists. */
  vendor: { _id: string; name: string; email: string; businessName?: string } | null;
};

export type AdminTransaction = {
  _id: string;
  vendorId: string;
  vendor: { _id: string; name: string; email: string; businessName?: string } | null;
  plan: string;
  /** Major units (9.99, not 999 cents). */
  amount: number;
  currency: string;
  status: TransactionStatus;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
};

export type RecentOrder = {
  _id: string;
  itemId: string;
  vendorId: string;
  customerId: string;
  status: OrderStatus;
  deliveryDate: string;
  createdAt: string;
};

export type AdminDashboard = {
  users: { total: number; customers: number; vendors: number; admins: number; blocked: number };
  menuItems: Record<MenuStatus, number> & { total: number };
  orders: Record<OrderStatus, number> & { total: number };
  transactions: Record<TransactionStatus, number> & { total: number };
  subscriptions: { activePremiumVendors: number };
  recent: {
    users: AdminUser[];
    orders: RecentOrder[];
    transactions: AdminTransaction[];
  };
};

/* -------------------------------------------------------------- dashboard */

export function getDashboard() {
  return request<AdminDashboard>("/api/admin/dashboard");
}

/* ------------------------------------------------------------- menu items */

export function listMenuItems(
  params: { status?: MenuStatus; category?: string; search?: string; page?: number; limit?: number } = {}
) {
  return request<AdminMenuItem[]>(`/api/admin/menu-items${query(params)}`);
}

/** Every category used by any item, in any status (the public /api/categories counts approved items only). */
export function listMenuCategories() {
  return request<{ name: string; count: number }[]>("/api/admin/menu-items/categories");
}

export function approveMenuItem(id: string) {
  return request<AdminMenuItem>(`/api/admin/menu-items/${id}/approve`, { method: "PATCH" });
}

export function rejectMenuItem(id: string) {
  return request<AdminMenuItem>(`/api/admin/menu-items/${id}/reject`, { method: "PATCH" });
}

/** Only `pending` -> approved/rejected and `approved` -> inactive are allowed (409 otherwise). */
export function setMenuItemStatus(id: string, status: MenuStatus) {
  return request<AdminMenuItem>(`/api/admin/menu-items/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteMenuItem(id: string) {
  return request<{ _id: string }>(`/api/admin/menu-items/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ users */

export function listUsers(
  params: { search?: string; role?: UserRole; status?: UserBlockFilter; page?: number; limit?: number } = {}
) {
  return request<AdminUser[]>(`/api/admin/users${query(params)}`);
}

/** One user's details (the server returns the same safe fields as the list: no passwords, tokens or sessions). */
export function getUser(id: string) {
  return request<AdminUser>(`/api/admin/users/${id}`);
}

/** Every vendor account (blocked ones too), unpaginated, for pickers. Takes no query parameters (the server answers 400). */
export function listVendors() {
  return request<{ _id: string; name: string; email: string; businessName: string | null }[]>("/api/admin/vendors");
}

export function blockUser(id: string) {
  return request<AdminUser>(`/api/admin/users/${id}/block`, { method: "PATCH" });
}

export function unblockUser(id: string) {
  return request<AdminUser>(`/api/admin/users/${id}/unblock`, { method: "PATCH" });
}

/* ----------------------------------------------------------- transactions */

export function listTransactions(
  params: { status?: TransactionStatus; vendorId?: string; page?: number; limit?: number } = {}
) {
  return request<AdminTransaction[]>(`/api/admin/transactions${query(params)}`);
}

/* ---------------------------------------------------------------- display */

/** The API already reports the effective plan; this also checks the expiry date for display. */
export function resolveUserPlan(user: Pick<AdminUser, "subscriptionPlan" | "subscriptionExpiresAt">): {
  premium: boolean;
  until: string | null;
} {
  const until = user.subscriptionExpiresAt;
  const premium = user.subscriptionPlan === "premium" && (!until || new Date(until).getTime() > Date.now());
  return { premium, until };
}

/** Formats a payment in the currency it was charged in (the backend sends "usd"). */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}
