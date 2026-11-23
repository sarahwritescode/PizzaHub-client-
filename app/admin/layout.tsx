import { Suspense, type ReactNode } from "react";
import { PageLoader } from "@/components/shared/page-loader";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
