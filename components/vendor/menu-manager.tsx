"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPinIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  MenuStatusBadge,
  PageHeader,
  Pager,
  Thumb,
  brandButtonClass,
  outlineButtonClass,
} from "@/components/vendor/shared";
import { useApiResource } from "@/hooks/use-api-resource";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { formatMenuPrice } from "@/lib/menu-api";
import {
  FREE_PLAN_ACTIVE_LIMIT,
  MENU_STATUS_LABEL,
  MENU_STATUSES,
  deleteMenuItem,
  formatDate,
  listMenuItems,
  setMenuItemAvailability,
  type MenuStatus,
  type VendorMenuItem,
} from "@/lib/vendor-api";

const PAGE_SIZE = 12;

export function LimitWarning({ active }: { active: number | null }) {
  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
    >
      <TriangleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong className="font-semibold">Free plan limit reached.</strong>{" "}
        {active !== null ? `You have ${active} active items` : "You have the maximum active items"} (the limit is{" "}
        {FREE_PLAN_ACTIVE_LIMIT}; pending and approved items count). Delete or deactivate one, or{" "}
        <Link href="/vendor/subscription" className="font-semibold underline">
          see Premium
        </Link>{" "}
        for unlimited items.
      </p>
    </div>
  );
}

export function MenuManager() {
  const [status, setStatus] = useState<MenuStatus | "">("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<VendorMenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const usage = usePlanUsage();
  const { result, loading, reload } = useApiResource(`menu:${status}:${page}`, () =>
    listMenuItems({ status: status || undefined, page, limit: PAGE_SIZE })
  );

  const items = useMemo(() => (result?.ok ? result.data : []), [result]);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.itemName, item.category, item.location, item.description].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  }, [items, search]);

  const pagination = result?.ok ? result.pagination : undefined;

  function refresh() {
    reload();
    usage.reload();
  }

  async function toggleAvailability(item: VendorMenuItem, isActive: boolean) {
    setBusyId(item._id);
    const response = await setMenuItemAvailability(item._id, isActive);
    setBusyId(null);
    if (response.ok) {
      toast.add({
        type: "success",
        title: isActive ? "Item activated" : "Item deactivated",
        description: response.message || undefined,
      });
    } else {
      if (response.code === "FREE_PLAN_LIMIT_REACHED") usage.markLimitReached();
      toast.add({ type: "error", title: "Could not change availability", description: response.message });
    }
    refresh();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const response = await deleteMenuItem(toDelete._id);
    setDeleting(false);
    if (response.ok) {
      toast.add({ type: "success", title: "Item deleted", description: `"${toDelete.itemName}" was removed.` });
      setToDelete(null);
      // Deleting the only item on the last page: go back one page.
      if (items.length === 1 && page > 1) setPage(page - 1);
      refresh();
    } else {
      // e.g. ITEM_HAS_OPEN_ORDERS (409): the server's message says why.
      toast.add({ type: "error", title: "Could not delete item", description: response.message });
      setToDelete(null);
    }
  }

  function changeStatus(next: string) {
    setStatus(next as MenuStatus | "");
    setPage(1);
  }

  const addDisabled = usage.atLimit;

  return (
    <>
      <PageHeader
        title="Menu"
        description="Manage the items customers can order. New and edited items are reviewed before they go live."
        actions={
          addDisabled ? (
            <Button disabled className="h-9 rounded-full px-4">
              <PlusIcon aria-hidden="true" /> Add menu item
            </Button>
          ) : (
            <Link href="/vendor/menu/add" className={brandButtonClass}>
              <PlusIcon aria-hidden="true" /> Add menu item
            </Link>
          )
        }
      />

      {usage.atLimit && <LimitWarning active={usage.active} />}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45"
          />
          <Input
            type="search"
            aria-label="Search menu items"
            placeholder="Search by name, category or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 bg-white pl-9"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => changeStatus(event.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
        >
          <option value="">All statuses</option>
          {MENU_STATUSES.map((value) => (
            <option key={value} value={value}>
              {MENU_STATUS_LABEL[value]}
            </option>
          ))}
        </select>
      </div>

      {!result && loading && <ListSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {items.length === 0 ? (
            status ? (
              <EmptyState
                title={`No ${MENU_STATUS_LABEL[status].toLowerCase()} items`}
                description="Try another status filter."
              />
            ) : (
              <EmptyState
                title="Your menu is empty"
                description="Add your first item. It becomes visible to customers once an admin approves it."
                action={
                  addDisabled ? undefined : (
                    <Link href="/vendor/menu/add" className={brandButtonClass}>
                      <PlusIcon aria-hidden="true" /> Add menu item
                    </Link>
                  )
                }
              />
            )
          ) : visible.length === 0 ? (
            <EmptyState
              title="No matches"
              description={`Nothing on this page matches "${search.trim()}".${
                pagination && pagination.totalPages > 1 ? " Search covers the items on the current page only." : ""
              }`}
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((item) => (
                <MenuRow
                  key={item._id}
                  item={item}
                  busy={busyId === item._id}
                  limitBlocked={usage.atLimit}
                  onToggle={(isActive) => toggleAvailability(item, isActive)}
                  onDelete={() => setToDelete(item)}
                />
              ))}
            </ul>
          )}
          {search.trim() && pagination && pagination.totalPages > 1 && visible.length > 0 && (
            <p className="mt-3 text-xs text-ink/55">Search covers the items on this page only.</p>
          )}
          {pagination && <Pager pagination={pagination} onPage={setPage} disabled={loading} />}
        </div>
      )}

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{toDelete?.itemName}&rdquo; will be removed permanently. Items with open orders cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep item</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const STATUS_HINT: Record<MenuStatus, string> = {
  pending: "Waiting for admin approval.",
  approved: "Live on the public menu.",
  inactive: "Hidden from the public menu.",
  rejected: "Rejected by an admin. Edit and resubmit it.",
};

function MenuRow({
  item,
  busy,
  limitBlocked,
  onToggle,
  onDelete,
}: {
  item: VendorMenuItem;
  busy: boolean;
  limitBlocked: boolean;
  onToggle: (isActive: boolean) => void;
  onDelete: () => void;
}) {
  // Availability only exists for approved <-> inactive. A vendor can never
  // approve a pending or rejected item (the server answers 409).
  const canToggle = item.status === "approved" || item.status === "inactive";
  const activating = item.status === "inactive";
  const toggleDisabled = busy || !canToggle || (activating && limitBlocked);

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-crust bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <Thumb src={item.images[0]} alt={item.itemName} className="size-20 sm:size-24" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-lg leading-tight font-bold text-ink">{item.itemName}</h2>
            <MenuStatusBadge status={item.status} />
          </div>
          <p className="mt-1 text-sm text-ink/70">
            <span className="font-semibold text-tomato">{formatMenuPrice(item.price)}</span> · {item.category}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/60">
            <MapPinIcon aria-hidden="true" className="size-3.5" /> {item.location} · added {formatDate(item.createdAt)}
          </p>
          <p className="mt-1 text-xs text-ink/55">{STATUS_HINT[item.status]}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
        <label
          className="flex items-center gap-2 text-xs font-medium text-ink/70"
          title={
            !canToggle
              ? "Only approved or inactive items can be switched on or off."
              : activating && limitBlocked
                ? "Free plan limit reached."
                : undefined
          }
        >
          <Switch
            checked={item.status === "approved"}
            disabled={toggleDisabled}
            onCheckedChange={(checked) => onToggle(checked)}
            aria-label={`${item.itemName} availability`}
          />
          {item.status === "approved" ? "Available" : "Unavailable"}
        </label>
        <Link href={`/vendor/menu/edit/${item._id}`} className={outlineButtonClass}>
          <PencilIcon aria-hidden="true" /> Edit
        </Link>
        <Button variant="destructive" size="icon" aria-label={`Delete ${item.itemName}`} onClick={onDelete}>
          <Trash2Icon aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
