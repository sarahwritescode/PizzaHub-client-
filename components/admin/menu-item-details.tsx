"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MenuStatusBadge } from "@/components/shared/status-badge";
import { Thumb } from "@/components/shared/thumb";
import { formatDate, type AdminMenuItem } from "@/lib/admin-api";
import { formatMenuPrice } from "@/lib/menu-api";

/** Read-only details of one menu item (every field the admin API returns). */
export function MenuItemDetails({ item, onClose }: { item: AdminMenuItem | null; onClose: () => void }) {
  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {item && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-6">
                <DialogTitle className="font-display text-xl font-bold text-ink">{item.itemName}</DialogTitle>
                <MenuStatusBadge status={item.status} />
              </div>
              <DialogDescription>
                {formatMenuPrice(item.price)} · {item.category}
              </DialogDescription>
            </DialogHeader>

            {item.images.length > 0 && (
              <ul className="grid grid-cols-3 gap-2" aria-label="Item images">
                {item.images.map((src, index) => (
                  <li key={`${src}-${index}`}>
                    <Thumb src={src} alt={`${item.itemName} image ${index + 1}`} className="aspect-square size-auto w-full" />
                  </li>
                ))}
              </ul>
            )}

            <p className="text-sm leading-relaxed whitespace-pre-line text-ink/80">{item.description}</p>

            <dl className="grid gap-3 border-t border-crust pt-4 text-sm sm:grid-cols-2">
              <Field label="Location">{item.location}</Field>
              <Field label="Added">{formatDate(item.createdAt, true)}</Field>
              <Field label="Vendor">
                {item.vendor ? (item.vendor.businessName ?? item.vendor.name) : "Vendor account removed"}
              </Field>
              <Field label="Vendor email">{item.vendor?.email ?? "-"}</Field>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-ink/55">{label}</dt>
      <dd className="break-words text-ink">{children}</dd>
    </div>
  );
}
