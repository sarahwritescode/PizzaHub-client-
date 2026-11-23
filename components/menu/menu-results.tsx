import Link from "next/link";
import { InView } from "@/components/home/in-view";
import { MenuCard } from "@/components/menu/menu-card";
import { MenuPagination } from "@/components/menu/menu-pagination";
import { MenuToolbar } from "@/components/menu/menu-toolbar";
import {
  buildMenuHref,
  fetchMenuCategories,
  fetchMenuItems,
  parseMenuQuery,
} from "@/lib/menu-api";

function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-crust bg-surface px-6 py-10 text-center">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-tomato px-6 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export async function MenuResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseMenuQuery(await searchParams);
  const [itemsResult, categoriesResult] = await Promise.all([
    fetchMenuItems(query),
    fetchMenuCategories(),
  ]);

  if (!itemsResult.ok) {
    return (
      <Notice
        title="We couldn't load the menu"
        body={`${itemsResult.message} Please try again in a moment.`}
        action={{ href: buildMenuHref(query), label: "Try again" }}
      />
    );
  }

  const { items, pagination } = itemsResult.data;
  const categories = categoriesResult.ok ? categoriesResult.data : [];
  const isFiltered = Boolean(query.category || query.search || query.location);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <MenuToolbar categories={categories} query={query} />

      {items.length === 0 ? (
        isFiltered ? (
          <Notice
            title="No pizzas match your filters"
            body="Try a different category, location or search term."
            action={{ href: "/menu", label: "Clear filters" }}
          />
        ) : (
          <Notice
            title="The menu is empty right now"
            body="New pizzas will show up here as soon as they are added."
          />
        )
      ) : (
        <div>
          <p className="mb-4 text-sm font-medium text-ink/60" aria-live="polite">
            {pagination.totalItems} {pagination.totalItems === 1 ? "item" : "items"}
          </p>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {items.map((item, index) => (
              <li key={item._id}>
                <InView className="h-full" delay={(index % 2) * 0.08} y={14}>
                  <MenuCard item={item} />
                </InView>
              </li>
            ))}
          </ul>
          <MenuPagination pagination={pagination} query={query} />
        </div>
      )}
    </div>
  );
}
