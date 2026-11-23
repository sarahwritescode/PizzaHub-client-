"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckIcon, CircleAlertIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { brandButtonClass, outlineButtonClass } from "@/components/shared/button-styles";
import { useSubscription } from "@/hooks/use-subscription";
import { formatDate } from "@/lib/vendor-api";

// Stripe's webhook switches Premium on, usually within a couple of seconds.
// Check every 2.5 s for up to ~50 s before saying it is slow.
const POLL_MS = 2500;
const POLL_MAX = 20;

function ResultCard({
  tone,
  icon,
  title,
  children,
  actions,
}: {
  tone: "success" | "waiting" | "warning" | "neutral";
  icon: ReactNode;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const ring = {
    success: "bg-emerald-100 text-emerald-700",
    waiting: "bg-tomato/10 text-tomato",
    warning: "bg-amber-100 text-amber-800",
    neutral: "bg-crust text-ink/70",
  }[tone];

  return (
    <section
      role="status"
      aria-live="polite"
      className="mx-auto mt-6 max-w-lg rounded-3xl border border-crust bg-surface p-8 text-center sm:p-10"
    >
      <span className={`mx-auto flex size-16 items-center justify-center rounded-full ${ring}`}>{icon}</span>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
      <div className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">{children}</div>
      {actions && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </section>
  );
}

/**
 * Where Stripe sends the vendor after paying. This page does NOT activate
 * anything: Premium is switched on only by the verified Stripe webhook, so it
 * re-reads the plan from the server until the webhook has done it.
 */
export function PaymentSuccess() {
  const { plan, reload } = useSubscription();
  const [gaveUp, setGaveUp] = useState(false);
  const tries = useRef(0);
  const waiting = !plan?.isPremium && !gaveUp;

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

  if (plan?.isPremium) {
    return (
      <ResultCard
        tone="success"
        icon={<CheckIcon aria-hidden="true" className="size-8" />}
        title="Payment successful"
        actions={
          <>
            <Link href="/vendor/menu/add" className={brandButtonClass}>
              Add a menu item
            </Link>
            <Link href="/vendor/subscription" className={outlineButtonClass}>
              View subscription
            </Link>
          </>
        }
      >
        You are now a Premium vendor.
        {plan.expiresAt ? ` Your plan is active until ${formatDate(plan.expiresAt.toISOString())}.` : ""} You can publish
        unlimited active menu items and your Premium badge is live.
      </ResultCard>
    );
  }

  if (gaveUp) {
    return (
      <ResultCard
        tone="warning"
        icon={<CircleAlertIcon aria-hidden="true" className="size-8" />}
        title="Your payment is taking longer than usual"
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                tries.current = 0;
                setGaveUp(false);
                reload();
              }}
              className={brandButtonClass}
            >
              Check again
            </button>
            <Link href="/vendor/subscription" className={outlineButtonClass}>
              View subscription
            </Link>
          </>
        }
      >
        If you completed the payment, Premium switches on as soon as Stripe confirms it. This page never activates it on
        its own. Check again in a minute.
      </ResultCard>
    );
  }

  return (
    <ResultCard
      tone="waiting"
      icon={<LoaderCircleIcon aria-hidden="true" className="size-8 animate-spin" />}
      title="Confirming your payment..."
    >
      We are waiting for Stripe to confirm it. This usually takes a few seconds. Please keep this page open.
    </ResultCard>
  );
}

/** Where Stripe sends the vendor after cancelling the checkout. Nothing was charged. */
export function PaymentCancelled() {
  return (
    <ResultCard
      tone="neutral"
      icon={<XIcon aria-hidden="true" className="size-8" />}
      title="Payment cancelled"
      actions={
        <>
          <Link href="/vendor/subscription" className={brandButtonClass}>
            Back to subscription
          </Link>
          <Link href="/vendor/dashboard" className={outlineButtonClass}>
            Go to dashboard
          </Link>
        </>
      }
    >
      You were not charged and your plan has not changed. You can upgrade to Premium whenever you are ready.
    </ResultCard>
  );
}
