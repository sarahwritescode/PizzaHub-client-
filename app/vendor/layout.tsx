import { Suspense, type ReactNode } from "react";
import { VendorShell } from "@/components/vendor/vendor-shell";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading...</p>}>
      <VendorShell>{children}</VendorShell>
    </Suspense>
  );
}
