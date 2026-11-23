import { Suspense, type ReactNode } from "react";
import { PageLoader } from "@/components/shared/page-loader";
import { CustomerShell } from "@/components/customer/customer-shell";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <CustomerShell>{children}</CustomerShell>
    </Suspense>
  );
}
