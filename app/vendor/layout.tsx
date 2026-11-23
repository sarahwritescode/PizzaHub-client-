import { Suspense, type ReactNode } from "react";
import { PageLoader } from "@/components/shared/page-loader";
import { VendorShell } from "@/components/vendor/vendor-shell";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <VendorShell>{children}</VendorShell>
    </Suspense>
  );
}
