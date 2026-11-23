"use client";

import { CrownIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockedBadge, RoleBadge } from "@/components/admin/badges";
import { ErrorState } from "@/components/shared/states";
import { useApiResource } from "@/hooks/use-api-resource";
import { formatDate, getUser, resolveUserPlan, type AdminUser } from "@/lib/admin-api";

/**
 * Details of one user, loaded fresh from GET /api/admin/users/:id. The API only
 * ever returns safe fields (no password hash, tokens or sessions), and this
 * dialog renders exactly those and nothing else.
 */
export function UserDetails({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {user && <Body id={user._id} fallback={user} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ id, fallback }: { id: string; fallback: AdminUser }) {
  const { result, reload } = useApiResource(`admin-user:${id}`, () => getUser(id));

  if (result && !result.ok) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>{fallback.email}</DialogDescription>
        </DialogHeader>
        <ErrorState message={result.message} onRetry={reload} />
      </>
    );
  }
  if (!result) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{fallback.name}</DialogTitle>
          <DialogDescription>Loading details...</DialogDescription>
        </DialogHeader>
        <Skeleton className="h-40 rounded-xl" />
      </>
    );
  }

  const user = result.data;
  const plan = user.role === "vendor" ? resolveUserPlan(user) : null;

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2 pr-6">
          <DialogTitle className="font-display text-xl font-bold text-ink">{user.name}</DialogTitle>
          <RoleBadge role={user.role} />
          {user.isBlocked && <BlockedBadge />}
        </div>
        <DialogDescription className="break-all">{user.email}</DialogDescription>
      </DialogHeader>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Field label="Account state">{user.isBlocked ? "Blocked" : "Active"}</Field>
        <Field label="Joined">{formatDate(user.createdAt, true)}</Field>
        {user.businessName && <Field label="Business name">{user.businessName}</Field>}
        {plan && (
          <Field label="Plan">
            <span className="inline-flex items-center gap-1">
              {plan.premium && <CrownIcon aria-hidden="true" className="size-3.5 text-amber-600" />}
              {plan.premium ? "Premium" : "Free"}
            </span>
          </Field>
        )}
        {plan?.premium && plan.until && <Field label="Premium until">{formatDate(plan.until)}</Field>}
      </dl>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-ink/55">{label}</dt>
      <dd className="break-words text-ink">{children}</dd>
    </div>
  );
}
