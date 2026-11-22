"use client";

import { useSyncExternalStore } from "react";

/**
 * One line per menu item. The orders API takes a single item per order and has
 * no quantity, so a line is either in the cart or it is not.
 */
export type CartItem = {
  id: string;
  name: string;
  price: number;
};

const STORAGE_KEY = "pizzahub-cart";
const EMPTY: readonly CartItem[] = [];

// Browser-only store, so the server and first client render both see an empty cart.
let cache: readonly CartItem[] = EMPTY;
const listeners = new Set<() => void>();

function read(): readonly CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return EMPTY;
    // Keep only the fields we use (older saves carried a quantity) and drop duplicates.
    const byId = new Map<string, CartItem>();
    for (const entry of parsed) {
      if (
        typeof entry?.id === "string" &&
        typeof entry.name === "string" &&
        typeof entry.price === "number"
      ) {
        byId.set(entry.id, { id: entry.id, name: entry.name, price: entry.price });
      }
    }
    return [...byId.values()];
  } catch {
    return EMPTY;
  }
}

function commit(next: readonly CartItem[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode); the in-memory cart still works.
  }
  listeners.forEach((notify) => notify());
}

// Keeps several open tabs in sync.
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  cache = read();
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  if (listeners.size === 0) {
    cache = read();
    window.addEventListener("storage", onStorage);
  }
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Returns false when the item was already in the cart. */
export function addToCart(item: CartItem): boolean {
  if (cache.some((entry) => entry.id === item.id)) return false;
  commit([...cache, item]);
  return true;
}

export function removeFromCart(id: string) {
  commit(cache.filter((entry) => entry.id !== id));
}

export function useCart() {
  const items = useSyncExternalStore(
    subscribe,
    () => cache,
    () => EMPTY
  );
  const total = items.reduce((sum, entry) => sum + entry.price, 0);
  return { items, count: items.length, total };
}
