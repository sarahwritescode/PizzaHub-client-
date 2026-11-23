"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, CircleAlertIcon, CrownIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ErrorState, PageHeader } from "@/components/vendor/shared";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { FREE_PLAN_ACTIVE_LIMIT, formatDate, startCheckout, type Plan } from "@/lib/vendor-api";

const FREE_FEATURES = [
  `Up to ${FREE_PLAN_ACTIVE_LIMIT} active menu items`,
  "Pending and approved items count toward the limit",
  "Order management",
];
const PREMIUM_FEATURES = ["Unlimited active menu items", "Order management", "Everything in Free"];

// After paying, Stripe's webhook switches Premium on, usually within a couple
// of seconds. Check every 2.5 s for up to ~50 s before saying it is slow.
const POLL_MS = 2500;
const POLL_MAX = 20;

/** Stripe checkout URLs are always https on a stripe.com host; never follow anything else. */
function isStripeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "stripe.com" || url.hostname.endsWith(".stripe.com"));
  } catch {
    return false;
  }
}

export function SubscriptionView() {
  const { plan, planError, active, reload } = usePlanUsage();
  const router = useRouter();
  const checkout = useSearchParams().get("checkout");
  const [starting, setStarting] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const tries = useRef(0);

  // Back from Stripe with ?checkout=success: the page does NOT assume Premium.
  // It waits for the webhook by re-reading the plan from the server.
  const waiting = checkout === "success" && !plan?.isPremium && !gaveUp;

  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => {
      tries.current += 1;
      if (tries.current >= POLL_MAX) {
        setGaveUp(true);
        return;
      }
      reload();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [waiting, reload]);

  async function upgrade() {
    setStarting(true);
    const response = await startCheckout();
    if (response.ok && isStripeUrl(response.data.url)) {
      // Leave for Stripe's own payment page. Keep the button busy meanwhile.
      window.location.assign(response.data.url);
      return;
    }
    setStarting(false);
    if (response.ok) {
      toast.add({ type: "error", title: "Could not start checkout", description: "The payment page address was not valid." });
      return;
    }
    // ALREADY_PREMIUM / SUBSCRIPTION_EXISTS: the plan changed under us, so show the real state.
    if (response.code === "ALREADY_PREMIUM" || response.code === "SUBSCRIPTION_EXISTS") reload();
    toast.add({
      type: "error",
      title: "Could not start checkout",
      description:
        response.code === "STRIPE_NOT_CONFIGURED"
          ? "Online payments are not set up on the server yet."
          : response.message,
    });
  }

  function dismissCheckoutNotice() {
    router.replace("/vendor/subscription");
  }

  return (
    <>
      <PageHeader title="Subscription" description="Your plan decides how many active menu items you can have." />

      {checkout === "success" && (
        <CheckoutNotice
          tone={plan?.isPremium ? "success" : gaveUp ? "warning" : "info"}
          title={
            plan?.isPremium
              ? "Payment received. You are now Premium."
              : gaveUp
                ? "Your payment is taking longer than usual"
                : "Processing your payment..."
          }
          onDismiss={waiting ? undefined : dismissCheckoutNotice}
          busy={waiting}
        >
          {plan?.isPremium
            ? "Unlimited active menu items are now on."
            : gaveUp
              ? "If you completed the payment, Premium will switch on as soon as Stripe confirms it. Refresh this page in a minute."
              : "We are waiting for Stripe to confirm it. This usually takes a few seconds."}
        </CheckoutNotice>
      )}
      {checkout === "cancelled" && (
        <CheckoutNotice tone="info" title="Checkout cancelled" onDismiss={dismissCheckoutNotice}>
          You were not charged. You can upgrade whenever you are ready.
        </CheckoutNotice>
      )}

      {!plan && planError && <ErrorState message={planError} onRetry={reload} />}
      {!plan && !planError ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : plan && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-crust bg-white p-5 sm:p-6" aria-label="Current plan">
            <p className="text-sm font-medium text-ink/65">Current plan</p>
            <p className="mt-1 flex items-center gap-2 font-display text-3xl font-extrabold text-ink">
              {plan.isPremium && <CrownIcon aria-hidden="true" className="size-6 text-amber-500" />}
              {plan.isPremium ? "Premium" : "Free"}
            </p>
            {plan.isPremium ? (
              <PremiumDetails plan={plan} />
            ) : (
              <>
                {plan.lapsed && (
                  <p className="mt-2 text-sm text-amber-900">
                    Your Premium plan has ended, so the Free limits apply. Your existing items are kept.
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
                  <Button onClick={upgrade} disabled={starting || waiting} className="h-10 w-full rounded-full">
                    {starting ? "Opening secure checkout..." : "Upgrade to Premium"}
                  </Button>
                  <p className="mt-2 text-xs text-ink/55">
                    You will pay on Stripe&apos;s secure page. Premium switches on once Stripe confirms the payment.
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

function PremiumDetails({ plan }: { plan: Plan }) {
  const until = plan.expiresAt ? formatDate(plan.expiresAt.toISOString()) : null;
  return (
    <div className="mt-2 space-y-1 text-sm text-ink/70">
      <p>Unlimited active items{until ? (plan.cancelAtPeriodEnd ? `, until ${until}` : `, paid until ${until}`) : ""}.</p>
      {plan.cancelAtPeriodEnd && (
        <p className="text-amber-900">
          Your subscription is cancelled and will not renew. You keep Premium until the date above.
        </p>
      )}
      {plan.status === "past_due" && (
        <p className="text-amber-900">
          Your last payment failed. Premium stays on for the period you already paid for; Stripe will retry the payment.
        </p>
      )}
    </div>
  );
}

function CheckoutNotice({
  tone,
  title,
  children,
  busy,
  onDismiss,
}: {
  tone: "success" | "info" | "warning";
  title: string;
  children: ReactNode;
  busy?: boolean;
  onDismiss?: () => void;
}) {
  const palette = {
    success: "border-emerald-300 bg-emerald-50 text-emerald-950",
    info: "border-crust bg-white text-ink",
    warning: "border-amber-300 bg-amber-50 text-amber-950",
  }[tone];
  const Icon = busy ? LoaderCircleIcon : tone === "warning" ? CircleAlertIcon : CheckIcon;

  return (
    <div role="status" className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${palette}`}>
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${busy ? "animate-spin" : ""}`} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5">{children}</p>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 text-xs font-semibold underline">
          Dismiss
        </button>
      )}
    </div>
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
