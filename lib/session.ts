import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { dashboardPathFor, isRole, type Role } from "@/lib/roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  isBlocked: boolean;
};

/**
 * Reads the session from the auth server (backend) on every call, so it
 * always reflects the real role / blocked state, not a cached cookie value.
 * It reads cookies(), so call it only below a <Suspense> boundary.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  const { data } = await authClient.getSession({
    fetchOptions: { headers: { cookie: cookieHeader }, cache: "no-store" },
  });
  if (!data?.user) return null;

  const user = data.user as typeof data.user & {
    role?: string | null;
    isBlocked?: boolean | null;
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    // Unknown / missing role is treated as the least privileged one.
    role: isRole(user.role) ? user.role : "customer",
    isBlocked: user.isBlocked === true,
  };
}

/**
 * Server-side guard for dashboard pages.
 * - not signed in           -> /sign-in
 * - blocked                 -> /sign-in?blocked=1
 * - signed in, wrong role   -> that user's own dashboard
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  if (user.isBlocked) redirect("/sign-in?blocked=1");
  if (user.role !== role) redirect(dashboardPathFor(user.role));
  return user;
}
