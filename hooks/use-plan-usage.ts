"use client";

import { useCallback, useState } from "react";
import { useApiResource } from "@/hooks/use-api-resource";
import { authClient } from "@/lib/auth-client";
import { FREE_PLAN_ACTIVE_LIMIT, countActiveMenuItems, resolvePlan } from "@/lib/vendor-api";

/**
 * How many active (pending + approved) items the vendor has, and whether the
 * Free plan limit blocks adding or re-activating another one.
 *
 * `atLimit` is a hint for warnings and disabled buttons; the backend is the
 * real gate and answers 403 FREE_PLAN_LIMIT_REACHED. When it does, call
 * `markLimitReached()` so the UI follows the server even if the plan shown in
 * the session was stale.
 */
export function usePlanUsage() {
  const { data: session } = authClient.useSession();
  const { result, reload } = useApiResource("active-count", countActiveMenuItems);
  const [refusedAt, setRefusedAt] = useState<number | null>(null);

  const plan = session?.user ? resolvePlan(session.user) : null;
  const active = result?.ok ? result.data : null;

  const computed = plan !== null && !plan.isPremium && active !== null && active >= FREE_PLAN_ACTIVE_LIMIT;
  // After a server refusal stay blocked until the active count drops below the
  // count that was refused.
  const refused = refusedAt !== null && (active === null || active >= refusedAt);

  const markLimitReached = useCallback(() => setRefusedAt(active ?? FREE_PLAN_ACTIVE_LIMIT), [active]);

  return {
    plan,
    active,
    atLimit: computed || refused,
    markLimitReached,
    reload,
  };
}
