import {
  TRANSACTION_STATUS_LABEL,
  USER_ROLE_LABEL,
  type TransactionStatus,
  type UserRole,
} from "@/lib/admin-api";

const badgeBase =
  "inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap";

const TRANSACTION_BADGE: Record<TransactionStatus, string> = {
  success: "bg-emerald-100 text-emerald-900",
  pending: "bg-amber-100 text-amber-900",
  failed: "bg-red-100 text-red-900",
  cancelled: "bg-stone-200 text-stone-700",
  expired: "bg-stone-200 text-stone-700",
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-ink text-page",
  vendor: "bg-tomato/10 text-tomato",
  customer: "bg-sky-100 text-sky-900",
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return <span className={`${badgeBase} ${TRANSACTION_BADGE[status]}`}>{TRANSACTION_STATUS_LABEL[status]}</span>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={`${badgeBase} ${ROLE_BADGE[role]}`}>{USER_ROLE_LABEL[role]}</span>;
}

export function BlockedBadge() {
  return <span className={`${badgeBase} bg-red-100 text-red-900`}>Blocked</span>;
}
