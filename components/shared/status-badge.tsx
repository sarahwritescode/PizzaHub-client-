import {
  MENU_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  type MenuStatus,
  type OrderStatus,
} from "@/lib/api/types";

const badgeBase =
  "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap";

const MENU_BADGE: Record<MenuStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  inactive: "bg-stone-200 text-stone-700",
  rejected: "bg-red-100 text-red-900",
};

const ORDER_BADGE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  accepted: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  cancelled: "bg-stone-200 text-stone-700",
};

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  return <span className={`${badgeBase} ${MENU_BADGE[status]}`}>{MENU_STATUS_LABEL[status]}</span>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`${badgeBase} ${ORDER_BADGE[status]}`}>{ORDER_STATUS_LABEL[status]}</span>;
}
