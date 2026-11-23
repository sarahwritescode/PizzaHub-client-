/**
 * Types and constants shared by every API module (customer, vendor, admin).
 * Field names mirror the backend (docs/CLIENT_API_GUIDE.md in the server repo).
 */

/** `pagination` block of every list response. */
export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/** Moderation status of a menu item. Only `approved` items are public. */
export const MENU_STATUSES = ["pending", "approved", "inactive", "rejected"] as const;
export type MenuStatus = (typeof MENU_STATUSES)[number];

/** Status of a customer order. `accepted`, `rejected` and `cancelled` are final. */
export const ORDER_STATUSES = ["pending", "accepted", "rejected", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

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
