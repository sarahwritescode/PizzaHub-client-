"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PizzaIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Pagination } from "@/lib/menu-api";
import {
  MENU_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  type MenuStatus,
  type OrderStatus,
} from "@/lib/vendor-api";

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

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/65">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-tomato/30 bg-tomato/5 p-8 text-center"
    >
      <TriangleAlertIcon aria-hidden="true" className="size-8 text-tomato" />
      <p className="max-w-md text-sm text-ink/80">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-crust bg-white/60 p-10 text-center">
      <PizzaIcon aria-hidden="true" className="size-9 text-tomato/50" strokeWidth={1.75} />
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {description && <p className="max-w-md text-sm text-ink/65">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function Pager({
  pagination,
  onPage,
  disabled,
}: {
  pagination: Pagination;
  onPage: (page: number) => void;
  disabled?: boolean;
}) {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        disabled={disabled || !pagination.hasPreviousPage}
        onClick={() => onPage(pagination.page - 1)}
      >
        <ChevronLeft aria-hidden="true" /> Previous
      </Button>
      <p className="min-w-24 text-center text-sm font-medium text-ink/70">
        Page {pagination.page} of {pagination.totalPages}
      </p>
      <Button
        variant="outline"
        disabled={disabled || !pagination.hasNextPage}
        onClick={() => onPage(pagination.page + 1)}
      >
        Next <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}

/** Square thumbnail with a pizza placeholder when there is no usable image. */
export function Thumb({ src, alt, className = "size-20" }: { src?: string; alt: string; className?: string }) {
  const usable = src && /^(https?:|blob:)/i.test(src) ? src : undefined;
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-crust ${className}`}>
      {usable ? (
        <Image src={usable} alt={alt} fill unoptimized sizes="96px" className="object-cover" />
      ) : (
        <span aria-hidden="true" className="flex size-full items-center justify-center text-tomato/50">
          <PizzaIcon className="size-1/2" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}

/** Brand-coloured buttons (also usable on <Link>). */
export const brandButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-tomato px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";
export const outlineButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-crust bg-white px-4 text-sm font-semibold text-ink outline-none transition-colors hover:border-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";
export const dangerButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-tomato/40 bg-white px-4 text-sm font-semibold text-tomato outline-none transition-colors hover:bg-tomato/10 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";
