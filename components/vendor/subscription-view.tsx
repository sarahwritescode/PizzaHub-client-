"use client";

import type { ReactNode } from "react";
import { CheckIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/vendor/shared";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { FREE_PLAN_ACTIVE_LIMIT, formatDate } from "@/lib/vendor-api";

const FREE_FEATURES = [
  `Up to ${FREE_PLAN_ACTIVE_LIMIT} active menu items`,
  "Pending and approved items count toward the limit",
  "Order management",
];
const PREMIUM_FEATURES = ["Unlimited active menu items", "Order management", "Everything in Free"];

export function SubscriptionView() {
  const { plan, active } = usePlanUsage();

  return (
    <>
      <PageHeader title="Subscription" description="Your plan decides how many active menu items you can have." />

      {!plan ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-crust bg-white p-5 sm:p-6" aria-label="Current plan">
            <p className="text-sm font-medium text-ink/65">Current plan</p>
            <p className="mt-1 flex items-center gap-2 font-display text-3xl font-extrabold text-ink">
              {plan.isPremium && <CrownIcon aria-hidden="true" className="size-6 text-amber-500" />}
              {plan.isPremium ? "Premium" : "Free"}
            </p>
            {plan.isPremium ? (
              <p className="mt-2 text-sm text-ink/70">
                Unlimited active items
                {plan.expiresAt ? `, active until ${formatDate(plan.expiresAt.toISOString())}` : ""}.
              </p>
            ) : (
              <>
                {plan.storedPlan === "premium" && (
                  <p className="mt-2 text-sm text-amber-900">
                    Your Premium plan has expired, so the Free limits apply. Your existing items are kept.
                  </p>
                )}
                <UsageMeter active={active} />
              </>
            )}
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <PlanCard title="Free" features={FREE_FEATURES} current={!plan.isPremium} />
            <PlanCard title="Premium" features={PREMIUM_FEATURES} current={plan.isPremium}>
              {!plan.isPremium && (
                <div className="mt-4">
                  <Button disabled className="h-10 w-full rounded-full">
                    Upgrade to Premium · Coming soon
                  </Button>
                  <p className="mt-2 text-xs text-ink/55">
                    Online upgrades are not available yet, so there is nothing to pay for here.
                  </p>
                </div>
              )}
            </PlanCard>
          </div>
        </div>
      )}
    </>
  );
}

function UsageMeter({ active }: { active: number | null }) {
  if (active === null) return <Skeleton className="mt-3 h-8 w-64" />;
  const percent = Math.min(100, Math.round((active / FREE_PLAN_ACTIVE_LIMIT) * 100));
  return (
    <div className="mt-3 max-w-md">
      <p className="text-sm text-ink/70">
        {active} of {FREE_PLAN_ACTIVE_LIMIT} active menu items used
        {active >= FREE_PLAN_ACTIVE_LIMIT ? ". You have reached the limit." : "."}
      </p>
      <div
        role="progressbar"
        aria-label="Active menu items used"
        aria-valuemin={0}
        aria-valuemax={FREE_PLAN_ACTIVE_LIMIT}
        aria-valuenow={Math.min(active, FREE_PLAN_ACTIVE_LIMIT)}
        className="mt-2 h-2 overflow-hidden rounded-full bg-crust"
      >
        <div className="h-full rounded-full bg-tomato" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function PlanCard({
  title,
  features,
  current,
  children,
}: {
  title: string;
  features: string[];
  current: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={`${title} plan`}
      className={`rounded-2xl border bg-white p-5 sm:p-6 ${current ? "border-tomato" : "border-crust"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {current && (
          <span className="rounded-full bg-tomato/10 px-2.5 py-0.5 text-xs font-semibold text-tomato">Your plan</span>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink/80">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            {feature}
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
