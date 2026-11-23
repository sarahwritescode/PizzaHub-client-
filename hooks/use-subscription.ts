"use client";

import { useApiResource } from "@/hooks/use-api-resource";
import { getSubscription, planFrom } from "@/lib/vendor-api";

/**
 * The vendor's plan from GET /api/vendor/subscription. The server is the
 * source of truth (not the session), so a payment confirmed by the webhook
 * shows up as soon as this is reloaded.
 */
export function useSubscription() {
  const { result, loading, reload } = useApiResource("vendor-subscription", getSubscription);
  return {
    plan: result?.ok ? planFrom(result.data) : null,
    error: result && !result.ok ? result.message : null,
    loading,
    reload,
  };
}
