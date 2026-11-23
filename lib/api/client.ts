/**
 * The one fetch wrapper every browser-side API module uses.
 *
 * Requests go to this site's own /api/* paths. next.config.ts rewrites them to
 * the backend, so the Better Auth session cookie is first-party and is sent
 * automatically (the backend accepts the cookie as well as a Bearer token).
 * No token is ever stored in localStorage.
 *
 * Every call resolves to an ApiResult and never throws, so callers can
 * branch on `ok` and show loading / error / success states.
 */
import type { Pagination } from "@/lib/api/types";

/** One entry of the backend's `errors` array (validation failures). */
export type FieldError = { field: string; message: string };

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  message: string;
  pagination?: Pagination;
};

export type ApiFailure = {
  ok: false;
  /** HTTP status, or 0 when the server could not be reached. */
  status: number;
  /** Backend error code, e.g. FREE_PLAN_LIMIT_REACHED, INVALID_STATUS_TRANSITION. */
  code?: string;
  message: string;
  errors?: FieldError[];
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export const NETWORK_ERROR_MESSAGE = "We could not reach the server. Check your connection.";

/** Builds an ApiFailure from an error response (`{ success:false, message, code?, errors? }`). */
export function failureFrom(status: number, body: unknown): ApiFailure {
  const parsed = (body ?? {}) as {
    message?: unknown;
    code?: unknown;
    errors?: unknown;
  };
  const errors = Array.isArray(parsed.errors)
    ? (parsed.errors as FieldError[]).filter(
        (entry) => typeof entry?.field === "string" && typeof entry?.message === "string"
      )
    : undefined;
  const code = typeof parsed.code === "string" ? parsed.code : undefined;

  let message: string;
  if (status === 401) message = "Your session has expired. Please sign in again.";
  else if (typeof parsed.message === "string" && parsed.message) message = parsed.message;
  else message = `The server responded with ${status}.`;

  // A validation failure is more useful with the field messages.
  if (code === "VALIDATION_ERROR" && errors?.length) {
    message = errors.map((entry) => entry.message).join(" ");
  }
  return { ok: false, status, code, message, errors };
}

export function networkFailure(): ApiFailure {
  return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
}

/**
 * JSON request against this site's /api/*. A body is sent as JSON; pass
 * `init.body` already stringified.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.success === false) return failureFrom(response.status, body);
    return {
      ok: true,
      data: body?.data as T,
      message: typeof body?.message === "string" ? body.message : "",
      pagination: body?.pagination,
    };
  } catch {
    return networkFailure();
  }
}

/** Builds a `?a=1&b=2` string, leaving out undefined and empty values. */
export function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
