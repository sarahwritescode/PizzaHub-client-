import { CheckIcon, ClockIcon, XIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/api/types";

type Step = { label: string; detail: string; state: "done" | "current" | "failed" };

/**
 * Builds the timeline from the order's real status only. The backend stores no
 * per-step timestamps, so the only date shown is when the order was placed;
 * nothing about a transition is invented.
 *
 *   pending   -> placed, waiting for the vendor
 *   accepted  -> placed, accepted by the vendor
 *   rejected  -> placed, rejected by the vendor
 *   cancelled -> placed, cancelled by you
 */
function stepsFor(status: OrderStatus, createdAt: string): Step[] {
  const placed: Step = { label: "Order placed", detail: formatDate(createdAt, true), state: "done" };
  switch (status) {
    case "pending":
      return [placed, { label: "Waiting for the vendor", detail: "The vendor has not answered yet.", state: "current" }];
    case "accepted":
      return [placed, { label: "Accepted by the vendor", detail: "The vendor agreed to deliver this order.", state: "done" }];
    case "rejected":
      return [placed, { label: "Rejected by the vendor", detail: "The vendor could not take this order.", state: "failed" }];
    case "cancelled":
      return [placed, { label: "Cancelled", detail: "You cancelled this order.", state: "failed" }];
  }
}

export function OrderTimeline({ status, createdAt }: { status: OrderStatus; createdAt: string }) {
  const steps = stepsFor(status, createdAt);

  return (
    <ol aria-label="Order status timeline" className="space-y-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const tone =
          step.state === "failed"
            ? "bg-red-100 text-red-700"
            : step.state === "current"
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-700";
        const Icon = step.state === "failed" ? XIcon : step.state === "current" ? ClockIcon : CheckIcon;

        return (
          <li key={step.label} className="relative flex gap-3 pb-6 last:pb-0" aria-current={step.state === "current" ? "step" : undefined}>
            {!last && <span aria-hidden="true" className="absolute top-8 bottom-0 left-4 w-px bg-crust" />}
            <span className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-ink">{step.label}</p>
              <p className="text-xs text-ink/60">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
