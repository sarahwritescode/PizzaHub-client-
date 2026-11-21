import { Suspense, type ReactNode } from "react";
import { RoleGate } from "@/components/dashboard/role-gate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading...</p>}>
      <RoleGate role="admin">{children}</RoleGate>
    </Suspense>
  );
}
