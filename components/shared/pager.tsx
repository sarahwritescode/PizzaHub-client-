"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pagination } from "@/lib/api/types";

/** Previous / Next controls driven by the backend's `pagination` block. */
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
