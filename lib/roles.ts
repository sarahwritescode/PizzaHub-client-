export const SIGNUP_ROLES = ["customer", "vendor"] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export const ROLES = ["admin", "vendor", "customer"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * Validates the `next` query param. Only a menu item path is honoured, so it
 * can never point at another site.
 */
export function safeNextPath(next: string | null): string | undefined {
  return next && /^\/menu\/[0-9a-f]{24}$/i.test(next) ? next : undefined;
}

/** Where to send a user after signing in. */
export function postSignInPath(next: string | null, role: unknown): string {
  return safeNextPath(next) ?? dashboardPathFor(role);
}

export function dashboardPathFor(role: unknown): string {
  // Vendors and customers have their own /vendor/* and /customer/* areas;
  // /dashboard/vendor and /dashboard/customer redirect there.
  if (role === "vendor") return "/vendor/dashboard";
  if (role === "customer") return "/customer/dashboard";
  return isRole(role) ? `/dashboard/${role}` : "/customer/dashboard";
}
