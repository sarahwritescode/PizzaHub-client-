"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResult } from "@/lib/vendor-api";

/**
 * Loads data from one of the vendor API helpers.
 *
 * - `key` identifies the request (filters, page, ...). When it changes, the
 *   data is fetched again.
 * - `loading` is true until the latest request has settled; `result` keeps the
 *   previous answer meanwhile, so lists don't blank out while paging.
 * - `reload()` fetches again with the same key (after a mutation).
 */
export function useApiResource<T>(key: string, fetcher: () => Promise<ApiResult<T>>) {
  const [reloads, setReloads] = useState(0);
  const requestKey = `${key}#${reloads}`;
  const [settled, setSettled] = useState<{ key: string; result: ApiResult<T> } | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef.current().then((result) => {
      if (!cancelled) setSettled({ key: requestKey, result });
    });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloads((count) => count + 1), []);

  return {
    result: settled?.result ?? null,
    loading: settled?.key !== requestKey,
    reload,
  };
}
