"use client";

import type { ReactNode } from "react";
import { PizzaIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Error state with an optional retry button. */
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

/** Empty state, optionally with a call to action. */
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

/** Loading placeholder for a list of rows or cards. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}
