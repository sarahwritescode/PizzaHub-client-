"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
};

const STORAGE_KEY = "pizzahub-cart";
const EMPTY: readonly CartItem[] = [];

// Browser-only store, so the server and first client render both see an empty cart.
let cache: readonly CartItem[] = EMPTY;
const listeners = new Set<() => void>();

function read(): readonly CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY;
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

export function addToCart(item: Omit<CartItem, "quantity">) {
  const existing = cache.find((entry) => entry.id === item.id);
  commit(
    existing
      ? cache.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        )
      : [...cache, { ...item, quantity: 1 }]
  );
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
  const count = items.reduce((sum, entry) => sum + entry.quantity, 0);
  return { items, count };
}
