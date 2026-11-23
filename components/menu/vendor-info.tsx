import { CrownIcon, StoreIcon } from "lucide-react";
import { vendorLabel, type MenuVendor } from "@/lib/menu-api";

/** The "Premium" badge shown next to a Premium vendor. */
export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 text-[11px] font-semibold text-amber-900 ${className}`}
    >
      <CrownIcon aria-hidden="true" className="size-3" />
      Premium
    </span>
  );
}

/** "Sold by <vendor>" with the Premium badge when the vendor has one. Renders nothing without vendor data. */
export function VendorInfo({ vendor }: { vendor?: MenuVendor }) {
  if (!vendor) return null;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink/65">
      <StoreIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{vendorLabel(vendor)}</span>
      {vendor.isPremium && <PremiumBadge />}
    </span>
  );
}
