import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMenuHref, type MenuQuery, type Pagination } from "@/lib/menu-api";

const linkBase =
  "inline-flex h-11 items-center gap-1.5 rounded-full border px-5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function MenuPagination({
  pagination,
  query,
}: {
  pagination: Pagination;
  query: MenuQuery;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <nav
      aria-label="Menu pages"
      className="mt-10 flex items-center justify-center gap-3 sm:mt-12"
    >
      {pagination.hasPreviousPage ? (
        <Link
          href={buildMenuHref({ ...query, page: pagination.page - 1 })}
          className={`${linkBase} border-crust bg-white text-ink hover:border-tomato`}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${linkBase} border-crust bg-white/60 text-ink/35`}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </span>
      )}

      <p className="min-w-24 text-center text-sm font-medium text-ink/70">
        Page {pagination.page} of {pagination.totalPages}
      </p>

      {pagination.hasNextPage ? (
        <Link
          href={buildMenuHref({ ...query, page: pagination.page + 1 })}
          className={`${linkBase} border-tomato bg-tomato text-cream hover:bg-tomato-deep`}
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${linkBase} border-crust bg-white/60 text-ink/35`}
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </span>
      )}
    </nav>
  );
}
