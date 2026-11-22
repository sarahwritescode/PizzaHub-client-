"use client";

import Link from "next/link";
import { ShoppingCartIcon, Trash2Icon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { removeFromCart, useCart } from "@/lib/cart";

export function CartButton() {
  const { items, count } = useCart();

  return (
    <Sheet>
      <SheetTrigger
        aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-ink outline-none transition-colors hover:bg-crust/60 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <ShoppingCartIcon aria-hidden="true" className="size-5" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-tomato px-1 text-[10px] leading-4 font-bold text-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-[85%] max-w-sm gap-0 bg-cream text-ink">
        <SheetHeader className="border-b border-crust p-4">
          <SheetTitle className="font-display text-xl font-bold">Your cart</SheetTitle>
          <SheetDescription className="sr-only">Items you have added to your order</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-ink/65">Your cart is empty.</p>
            <Link
              href="/menu"
              className="inline-flex h-10 items-center rounded-full bg-tomato px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-crust overflow-y-auto px-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-ink/65">Qty {item.quantity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="inline-flex size-8 items-center justify-center rounded-full text-ink/65 outline-none transition-colors hover:bg-crust/60 hover:text-ink focus-visible:ring-2 focus-visible:ring-tomato"
                >
                  <Trash2Icon aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
