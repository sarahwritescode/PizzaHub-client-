import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import {
  SORT_OPTIONS,
  buildMenuHref,
  type MenuCategory,
  type MenuQuery,
} from "@/lib/menu-api";

const pillBase =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const fieldBase =
  "h-11 rounded-full border border-crust bg-surface px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/45 focus-visible:border-tomato focus-visible:ring-2 focus-visible:ring-tomato/30";

export function MenuToolbar({
  categories,
  query,
}: {
  categories: MenuCategory[];
  query: MenuQuery;
}) {
  const allActive = !query.category;
  const activeCategory = query.category?.toLowerCase();

  return (
    <div className="flex flex-col gap-6">
      <nav
        aria-label="Menu categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
      >
        <Link
          href={buildMenuHref({ search: query.search, location: query.location, sort: query.sort })}
          aria-current={allActive ? "page" : undefined}
          className={`${pillBase} ${
            allActive
              ? "border-tomato bg-tomato text-cream"
              : "border-crust bg-surface text-ink hover:border-tomato"
          }`}
        >
          All
        </Link>
        {categories.map((category) => {
          const active = activeCategory === category.name.toLowerCase();
          return (
            <Link
              key={category.name}
              href={buildMenuHref({
                category: category.name,
                search: query.search,
                location: query.location,
                sort: query.sort,
              })}
              aria-current={active ? "page" : undefined}
              className={`${pillBase} ${
                active
                  ? "border-tomato bg-tomato text-cream"
                  : "border-crust bg-surface text-ink hover:border-tomato"
              }`}
            >
              {category.name}
              <span
                className={`text-xs font-medium ${active ? "text-cream/80" : "text-ink/50"}`}
              >
                {category.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Plain GET form: works without JavaScript and keeps the URL shareable. */}
      <form
        action="/menu"
        method="get"
        role="search"
        className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
      >
        {query.category && (
          <input type="hidden" name="category" value={query.category} />
        )}
        <div className="relative flex-1">
          <label htmlFor="menu-search" className="sr-only">
            Search the menu
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/50"
          />
          <input
            id="menu-search"
            type="search"
            name="search"
            maxLength={100}
            defaultValue={query.search}
            placeholder="Search pizzas or ingredients"
            className={`${fieldBase} w-full pl-10`}
          />
        </div>
        <div className="relative sm:w-48">
          <label htmlFor="menu-location" className="sr-only">
            Filter by location
          </label>
          <MapPin
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/50"
          />
          <input
            id="menu-location"
            type="text"
            name="location"
            maxLength={100}
            defaultValue={query.location}
            placeholder="Location"
            className={`${fieldBase} w-full pl-10`}
          />
        </div>
        <div>
          <label htmlFor="menu-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="menu-sort"
            name="sort"
            defaultValue={query.sort}
            className={`${fieldBase} w-full sm:w-auto`}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-11 rounded-full bg-ink px-6 text-sm font-semibold text-page outline-none transition-colors hover:bg-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
