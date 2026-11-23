import { Suspense, type ReactNode } from "react";
import { CustomerShell } from "@/components/customer/customer-shell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading...</p>}>
      <CustomerShell>{children}</CustomerShell>
    </Suspense>
  );
}
