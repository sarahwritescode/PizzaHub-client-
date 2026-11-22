"use client";

import { authClient } from "@/lib/auth-client";
import { NAV_LINKS, type NavLink } from "@/lib/nav";
import { dashboardPathFor } from "@/lib/roles";

/** Public links, plus a role-aware Dashboard link once the user is signed in. */
export function useNavLinks(): readonly NavLink[] {
  const { data: session } = authClient.useSession();
  if (!session?.user) return NAV_LINKS;
  return [...NAV_LINKS, { label: "Dashboard", href: dashboardPathFor(session.user.role) }];
}
