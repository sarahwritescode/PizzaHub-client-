"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BanIcon, CheckIcon, EyeIcon, MapPinIcon, SearchIcon, Trash2Icon, XIcon } from "lucide-react";
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
import { MenuItemDetails } from "@/components/admin/menu-item-details";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { brandButtonClass, dangerButtonClass, outlineButtonClass } from "@/components/shared/button-styles";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Pager } from "@/components/shared/pager";
import { MenuStatusBadge } from "@/components/shared/status-badge";
import { Thumb } from "@/components/shared/thumb";
import { useApiResource } from "@/hooks/use-api-resource";
import {
  MENU_STATUS_LABEL,
  MENU_STATUSES,
  approveMenuItem,
  deleteMenuItem,
  formatDate,
  listMenuItems,
  rejectMenuItem,
  setMenuItemStatus,
  type AdminMenuItem,
  type MenuStatus,
} from "@/lib/admin-api";
import { formatMenuPrice } from "@/lib/menu-api";

const PAGE_SIZE = 12;

type Action = { item: AdminMenuItem; kind: "reject" | "deactivate" | "delete" };

const ACTION_COPY: Record<Action["kind"], { title: string; confirm: string; done: string; describe: (name: string) => string }> = {
  reject: {
    title: "Reject this item?",
    confirm: "Reject item",
    done: "Item rejected",
    describe: (name) =>
      `"${name}" will not appear on the public menu. The vendor can edit it to send it back for approval.`,
  },
  deactivate: {
    title: "Take this item off the menu?",
    confirm: "Deactivate item",
    done: "Item deactivated",
    describe: (name) =>
      `"${name}" will be hidden from the public menu. Only its vendor can switch it back on.`,
  },
  delete: {
    title: "Delete this item?",
    confirm: "Delete",
    done: "Item deleted",
    describe: (name) =>
      `"${name}" will be removed permanently. Items with open orders cannot be deleted.`,
  },
};

function isMenuStatus(value: string | null): value is MenuStatus {
  return value !== null && (MENU_STATUSES as readonly string[]).includes(value);
}

export function MenuModeration() {
  // The overview links here with ?status=pending.
  const initial = useSearchParams().get("status");
  const [status, setStatus] = useState<MenuStatus | "">(isMenuStatus(initial) ? initial : "");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState<AdminMenuItem | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [working, setWorking] = useState(false);

  const { result, loading, reload } = useApiResource(`admin-menu:${status}:${category}:${search}:${page}`, () =>
    listMenuItems({
      status: status || undefined,
      category: category || undefined,
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    })
  );

  // The category filter lists the categories of the newest 50 items (the server has no categories endpoint for admins).
  const { result: sample } = useApiResource("admin-menu-categories", () => listMenuItems({ limit: 50 }));
  const categories = [
    ...new Set([...(sample?.ok ? sample.data.map((entry) => entry.category) : []), ...(category ? [category] : [])]),
  ].sort((a, b) => a.localeCompare(b));

  const items = result?.ok ? result.data : [];
  const pagination = result?.ok ? result.pagination : undefined;

  function changeStatus(next: string) {
    setStatus(next as MenuStatus | "");
    setPage(1);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function approve(item: AdminMenuItem) {
    setBusyId(item._id);
    const response = await approveMenuItem(item._id);
    setBusyId(null);
    if (response.ok) {
      toast.add({ type: "success", title: "Item approved", description: `"${item.itemName}" is now on the public menu.` });
    } else {
      toast.add({ type: "error", title: "Could not approve the item", description: response.message });
    }
    // Refresh either way so the list shows the item's real current status.
    reload();
  }

  async function confirmAction() {
    if (!pending) return;
    const { item, kind } = pending;
    setWorking(true);
    const response =
      kind === "reject"
        ? await rejectMenuItem(item._id)
        : kind === "deactivate"
          ? await setMenuItemStatus(item._id, "inactive")
          : await deleteMenuItem(item._id);
    setWorking(false);
    setPending(null);

    if (response.ok) {
      toast.add({ type: "success", title: ACTION_COPY[kind].done, description: `"${item.itemName}"` });
      // Removing the only row of the last page: step back one page.
      if (kind === "delete" && items.length === 1 && page > 1) setPage(page - 1);
    } else {
      // e.g. 409 INVALID_STATUS_TRANSITION or ITEM_HAS_OPEN_ORDERS: the server says why.
      toast.add({ type: "error", title: "Could not update the item", description: response.message });
    }
    reload();
  }

  return (
    <>
      <PageHeader
        title="Manage menu items"
        description="Review vendor items before they go live. Approved items appear on the home page and the public menu."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={submitSearch} role="search" className="relative flex flex-1 gap-2">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45"
          />
          <Input
            type="search"
            aria-label="Search by item name"
            placeholder="Search by item name"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
            className="h-10 bg-white pl-9"
          />
          <Button type="submit" variant="outline" className="h-10">
            Search
          </Button>
        </form>
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
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
        >
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {!result && loading && <ListSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {items.length === 0 ? (
            <EmptyState
              title={status && !category ? `No ${MENU_STATUS_LABEL[status].toLowerCase()} items` : "No menu items found"}
              description={
                search || status || category ? "Try another search or filter." : "Vendor items will appear here for review."
              }
            />
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <ModerationRow
                  key={item._id}
                  item={item}
                  busy={busyId === item._id}
                  onApprove={() => approve(item)}
                  onDetails={() => setDetails(item)}
                  onAction={(kind) => setPending({ item, kind })}
                />
              ))}
            </ul>
          )}
          {pagination && <Pager pagination={pagination} onPage={setPage} disabled={loading} />}
        </div>
      )}

      <MenuItemDetails item={details} onClose={() => setDetails(null)} />

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && !working && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending ? ACTION_COPY[pending.kind].title : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending ? ACTION_COPY[pending.kind].describe(pending.item.itemName) : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Go back</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmAction} disabled={working}>
              {working ? "Working..." : pending ? ACTION_COPY[pending.kind].confirm : ""}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ModerationRow({
  item,
  busy,
  onApprove,
  onDetails,
  onAction,
}: {
  item: AdminMenuItem;
  busy: boolean;
  onApprove: () => void;
  onDetails: () => void;
  onAction: (kind: Action["kind"]) => void;
}) {
  const vendorLabel = item.vendor
    ? `${item.vendor.businessName ?? item.vendor.name} (${item.vendor.email})`
    : "Vendor account removed";

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-crust bg-white p-4 lg:flex-row lg:items-center">
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
          <p className="mt-1 truncate text-xs text-ink/60">By {vendorLabel}</p>
          <p className="mt-1 line-clamp-2 text-xs text-ink/55">{item.description}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
        <button type="button" onClick={onDetails} className={outlineButtonClass}>
          <EyeIcon aria-hidden="true" /> Details
        </button>
        {item.status === "pending" && (
          <>
            <button type="button" disabled={busy} onClick={() => onAction("reject")} className={dangerButtonClass}>
              <XIcon aria-hidden="true" /> Reject
            </button>
            <button type="button" disabled={busy} onClick={onApprove} className={brandButtonClass}>
              <CheckIcon aria-hidden="true" /> {busy ? "Approving..." : "Approve"}
            </button>
          </>
        )}
        {item.status === "approved" && (
          <button type="button" disabled={busy} onClick={() => onAction("deactivate")} className={outlineButtonClass}>
            <BanIcon aria-hidden="true" /> Deactivate
          </button>
        )}
        <Button
          variant="destructive"
          size="icon"
          aria-label={`Delete ${item.itemName}`}
          disabled={busy}
          onClick={() => onAction("delete")}
        >
          <Trash2Icon aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
