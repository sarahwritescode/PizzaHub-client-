"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/vendor/shared";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/hooks/use-subscription";

export function ProfileView() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const { plan } = useSubscription();

  const rows = user
    ? [
        ["Name", user.name],
        ["Email", user.email],
        ["Business name", user.businessName || "Not set"],
        ["Role", "Vendor"],
        ["Plan", plan ? (plan.isPremium ? "Premium" : "Free") : "Loading..."],
      ]
    : [];

  return (
    <>
      <PageHeader title="Profile" description="Your account details." />
      {isPending && <Skeleton className="h-64 max-w-xl rounded-2xl" />}
      {!isPending && !user && (
        <p className="text-sm text-ink/65">We could not load your account. Please sign in again.</p>
      )}
      {user && (
        <section className="max-w-xl rounded-2xl border border-crust bg-white p-5 sm:p-6" aria-label="Account details">
          <dl className="divide-y divide-crust">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0">
                <dt className="font-medium text-ink/60">{label}</dt>
                <dd className="font-semibold break-all text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-ink/55">Editing profile details is not available yet.</p>
        </section>
      )}
    </>
  );
}
