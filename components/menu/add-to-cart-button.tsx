"use client";

import { CheckIcon, ShoppingCartIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { addToCart, useCart } from "@/lib/cart";

type Props = { id: string; name: string; price: number };

export function AddToCartButton({ id, name, price }: Props) {
  const { items } = useCart();
  const inCart = items.some((item) => item.id === id);

  return (
    <button
      type="button"
      disabled={inCart}
      onClick={() => {
        if (addToCart({ id, name, price })) {
          toast.add({ type: "success", title: "Added to cart", description: name });
        }
      }}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-tomato px-8 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-default disabled:bg-ink/10 disabled:text-ink/60"
    >
      {inCart ? (
        <CheckIcon aria-hidden="true" className="size-4" />
      ) : (
        <ShoppingCartIcon aria-hidden="true" className="size-4" />
      )}
      {inCart ? "In your cart" : "Add to cart"}
    </button>
  );
}
