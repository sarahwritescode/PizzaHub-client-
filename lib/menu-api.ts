/**
 * Client for the public menu endpoints documented in clude.md:
 *   GET /api/menu-items   (search, category, sortBy, order, page, limit)
 *   GET /api/categories   ([{ name, count }])
 * Filtering, sorting and pagination are done by the server.
 */
import type { Pagination } from "@/lib/api/types";

export type MenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  createdAt: string;
};

// Defined in lib/api/types.ts (shared by every list endpoint).
export type { Pagination };

export type MenuCategory = { name: string; count: number };

export const MENU_PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first", sortBy: "createdAt", order: "desc" },
  { value: "price-asc", label: "Price: low to high", sortBy: "price", order: "asc" },
  { value: "price-desc", label: "Price: high to low", sortBy: "price", order: "desc" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type MenuQuery = {
  category?: string;
  search?: string;
  sort: SortValue;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Turns raw URL params into values the API accepts. The server answers 400 for
 * out-of-range values, so everything is validated here before it is sent.
 */
export function parseMenuQuery(raw: RawParams): MenuQuery {
  const category = first(raw.category)?.trim().slice(0, 100) || undefined;
  const search = first(raw.search)?.trim().slice(0, 100) || undefined;

  const sortParam = first(raw.sort);
  const sort =
    SORT_OPTIONS.find((option) => option.value === sortParam)?.value ?? "newest";

  const pageNumber = Number.parseInt(first(raw.page) ?? "", 10);
  const page =
    Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= 100000
      ? pageNumber
      : 1;

  return { category, search, sort, page };
}

/** Builds a /menu URL, leaving out values that are already the default. */
export function buildMenuHref(query: Partial<MenuQuery>): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `/menu?${qs}` : "/menu";
}

// The API does not state a currency. Prices look like local taka (e.g. 400, Dhaka).
const CURRENCY = "BDT";

export function formatMenuPrice(price: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: CURRENCY,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(price);
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };

function apiBaseUrl(): string | undefined {
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  return base?.replace(/\/$/, "");
}

async function getJson<T>(path: string): Promise<ApiResult<T>> {
  const base = apiBaseUrl();
  if (!base) {
    return { ok: false, message: "The server address is not configured." };
  }

  try {
    const response = await fetch(`${base}${path}`, { cache: "no-store" });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.success) {
      return {
        ok: false,
        message: body?.message ?? `The server responded with ${response.status}.`,
        status: response.status,
      };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, message: "We could not reach the server." };
  }
}

export async function fetchMenuItems(
  query: MenuQuery,
): Promise<ApiResult<{ items: MenuItem[]; pagination: Pagination }>> {
  const sort = SORT_OPTIONS.find((option) => option.value === query.sort)!;
  const params = new URLSearchParams({
    sortBy: sort.sortBy,
    order: sort.order,
    page: String(query.page),
    limit: String(MENU_PAGE_SIZE),
  });
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);

  const result = await getJson<{ data: MenuItem[]; pagination: Pagination }>(
    `/api/menu-items?${params}`,
  );
  if (!result.ok) return result;
  return {
    ok: true,
    data: { items: result.data.data, pagination: result.data.pagination },
  };
}

export async function fetchMenuCategories(): Promise<ApiResult<MenuCategory[]>> {
  const result = await getJson<{ data: MenuCategory[] }>("/api/categories");
  if (!result.ok) return result;
  return { ok: true, data: result.data.data };
}

/** The API only accepts 24-character hex ObjectIds and answers 400 otherwise. */
export function isMenuItemId(id: string): boolean {
  return /^[0-9a-f]{24}$/i.test(id);
}

/**
 * One item by id. `status: 404` on a failure means the item does not exist or
 * is not public; the caller should show a not-found page.
 */
export async function fetchMenuItem(id: string): Promise<ApiResult<MenuItem>> {
  if (!isMenuItemId(id)) {
    return { ok: false, message: "Item not found.", status: 404 };
  }
  const result = await getJson<{ data: MenuItem }>(
    `/api/menu-items/${encodeURIComponent(id)}`,
  );
  if (!result.ok) return result;
  return { ok: true, data: result.data.data };
}

/** Link target for an item's details page. */
export function getMenuItemHref(id: string): string {
  return `/menu/${encodeURIComponent(id)}`;
}
