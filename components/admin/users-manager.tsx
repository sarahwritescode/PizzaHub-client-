"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CrownIcon, EyeIcon, SearchIcon } from "lucide-react";
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
import { toast } from "@/components/ui/toast";
import { BlockedBadge, RoleBadge } from "@/components/admin/badges";
import { UserDetails } from "@/components/admin/user-details";
import { outlineButtonClass } from "@/components/shared/button-styles";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Pager } from "@/components/shared/pager";
import { authClient } from "@/lib/auth-client";
import { useApiResource } from "@/hooks/use-api-resource";
import {
  USER_BLOCK_FILTERS,
  USER_ROLES,
  USER_ROLE_LABEL,
  blockUser,
  formatDate,
  listUsers,
  unblockUser,
  type AdminUser,
  type UserBlockFilter,
  type UserRole,
} from "@/lib/admin-api";

const PAGE_SIZE = 12;
const selectClass =
  "h-10 w-full rounded-lg border border-input bg-surface px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-40";

type Toggle = { user: AdminUser; kind: "block" | "unblock" };

export function UsersManager() {
  // The overview links here with ?status=blocked or ?role=vendor.
  const params = useSearchParams();
  const initial = params.get("status");
  const initialRole = params.get("role");
  const { data: session } = authClient.useSession();
  const [role, setRole] = useState<UserRole | "">(
    (USER_ROLES as readonly string[]).includes(initialRole ?? "") ? (initialRole as UserRole) : ""
  );
  const [details, setDetails] = useState<AdminUser | null>(null);
  const [blockFilter, setBlockFilter] = useState<UserBlockFilter | "">(
    (USER_BLOCK_FILTERS as readonly string[]).includes(initial ?? "") ? (initial as UserBlockFilter) : ""
  );
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [toggle, setToggle] = useState<Toggle | null>(null);
  const [working, setWorking] = useState(false);

  const { result, loading, reload } = useApiResource(`admin-users:${role}:${blockFilter}:${search}:${page}`, () =>
    listUsers({
      role: role || undefined,
      status: blockFilter || undefined,
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    })
  );

  const users = result?.ok ? result.data : [];
  const pagination = result?.ok ? result.pagination : undefined;

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function confirmToggle() {
    if (!toggle) return;
    const { user, kind } = toggle;
    setWorking(true);
    const response = kind === "block" ? await blockUser(user._id) : await unblockUser(user._id);
    setWorking(false);
    setToggle(null);

    if (response.ok) {
      toast.add({
        type: "success",
        title: kind === "block" ? "User blocked" : "User unblocked",
        description: `${user.name} (${user.email})`,
      });
    } else {
      // e.g. 409 ALREADY_BLOCKED when another admin acted first.
      toast.add({ type: "error", title: `Could not ${kind} the user`, description: response.message });
    }
    reload();
  }

  return (
    <>
      <PageHeader title="Manage users" description="Find accounts, see their details, and block or unblock customers and vendors." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row">
        <form onSubmit={submitSearch} role="search" className="relative flex flex-1 gap-2">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45"
          />
          <Input
            type="search"
            aria-label="Search users by name or email"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="h-10 bg-surface pl-9"
          />
          <Button type="submit" variant="outline" className="h-10">
            Search
          </Button>
        </form>
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(event) => {
            setRole(event.target.value as UserRole | "");
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All roles</option>
          {USER_ROLES.map((value) => (
            <option key={value} value={value}>
              {USER_ROLE_LABEL[value]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by account state"
          value={blockFilter}
          onChange={(event) => {
            setBlockFilter(event.target.value as UserBlockFilter | "");
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Any state</option>
          <option value="unblocked">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {!result && loading && <ListSkeleton />}
      {result && !result.ok && <ErrorState message={result.message} onRetry={reload} />}

      {result?.ok && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
          {users.length === 0 ? (
            <EmptyState title="No users found" description="Try a different search or filter." />
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  isSelf={user._id === session?.user.id}
                  onToggle={(kind) => setToggle({ user, kind })}
                  onDetails={() => setDetails(user)}
                />
              ))}
            </ul>
          )}
          {pagination && <Pager pagination={pagination} onPage={setPage} disabled={loading} />}
        </div>
      )}

      <UserDetails user={details} onClose={() => setDetails(null)} />

      <AlertDialog open={toggle !== null} onOpenChange={(open) => !open && !working && setToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{toggle?.kind === "block" ? "Block this user?" : "Unblock this user?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {toggle?.kind === "block"
                ? `${toggle.user.name} will be signed out and cannot sign in again until unblocked. Nothing is deleted.${
                    toggle.user.role === "vendor" ? " Their approved items leave the public menu until they are unblocked." : ""
                  }`
                : `${toggle?.user.name} will be able to sign in again.${
                    toggle?.user.role === "vendor" ? " Their approved items return to the public menu." : ""
                  }`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Go back</AlertDialogCancel>
            <Button
              variant={toggle?.kind === "block" ? "destructive" : "default"}
              onClick={confirmToggle}
              disabled={working}
            >
              {working ? "Working..." : toggle?.kind === "block" ? "Block user" : "Unblock user"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function UserRow({
  user,
  isSelf,
  onToggle,
  onDetails,
}: {
  user: AdminUser;
  isSelf: boolean;
  onToggle: (kind: Toggle["kind"]) => void;
  onDetails: () => void;
}) {
  const premium = user.role === "vendor" && user.subscriptionPlan === "premium";

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-crust bg-surface p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-display text-lg leading-tight font-bold text-ink">{user.name}</h2>
          <RoleBadge role={user.role} />
          {user.isBlocked && <BlockedBadge />}
          {premium && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-100 px-2.5 text-xs font-semibold text-amber-900">
              <CrownIcon aria-hidden="true" className="size-3" /> Premium
            </span>
          )}
          {isSelf && <span className="text-xs font-medium text-ink/55">(you)</span>}
        </div>
        <p className="mt-1 truncate text-sm text-ink/70">{user.email}</p>
        <p className="mt-0.5 truncate text-xs text-ink/55">
          {user.businessName ? `${user.businessName} · ` : ""}Joined {formatDate(user.createdAt)}
          {premium && user.subscriptionExpiresAt ? ` · Premium until ${formatDate(user.subscriptionExpiresAt)}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button type="button" onClick={onDetails} className={outlineButtonClass}>
          <EyeIcon aria-hidden="true" /> Details
        </button>
        {user.role === "admin" || isSelf ? (
          <p className="text-xs text-ink/55">Admins cannot be blocked.</p>
        ) : user.isBlocked ? (
          <Button variant="outline" onClick={() => onToggle("unblock")}>
            Unblock
          </Button>
        ) : (
          <Button variant="destructive" onClick={() => onToggle("block")}>
            Block
          </Button>
        )}
      </div>
    </li>
  );
}
