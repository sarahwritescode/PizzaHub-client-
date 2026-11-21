import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import type { Role } from "@/lib/roles";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

const TITLES: Record<Role, string> = {
  admin: "Admin Dashboard",
  vendor: "Vendor Dashboard",
  customer: "Customer Dashboard",
};

// Server component: verifies the session AND the role on the server before
// rendering anything. Must be rendered inside a <Suspense> boundary.
export async function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const user = await requireRole(role);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">{TITLES[role]}</h1>
          <p className="text-sm text-muted-foreground">
            {user.name} ({user.email})
          </p>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
