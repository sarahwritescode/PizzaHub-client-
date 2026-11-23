import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { AdminNav } from "@/components/admin/admin-nav";

// Server component: verifies the session AND the admin role on the server
// before rendering anything (same guard as the vendor area). Render it inside
// a <Suspense> boundary, because it reads cookies.
export async function AdminShell({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");

  return (
    <div className="flex flex-1 flex-col bg-cream md:flex-row">
      <aside className="border-b border-crust bg-white/60 p-3 md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-5">
        <div className="mb-3 hidden md:block">
          <p className="text-xs font-semibold tracking-wide text-tomato uppercase">Admin</p>
          <p className="mt-1 truncate font-display text-lg font-bold text-ink">{user.name}</p>
          <p className="truncate text-xs text-ink/60">{user.email}</p>
        </div>
        <AdminNav />
        <div className="mt-3 md:mt-4">
          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
