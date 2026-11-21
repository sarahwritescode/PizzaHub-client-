export const SIGNUP_ROLES = ["customer", "vendor"] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export const ROLES = ["admin", "vendor", "customer"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function dashboardPathFor(role: unknown): string {
  return isRole(role) ? `/dashboard/${role}` : "/dashboard/customer";
}
