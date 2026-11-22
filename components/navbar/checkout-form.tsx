"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { removeFromCart, type CartItem } from "@/lib/cart";
import { formatMenuPrice } from "@/lib/menu-api";
import { ADDRESS_MAX, MESSAGE_MAX, placeOrder, todayUtc } from "@/lib/orders-api";

type Props = {
  items: readonly CartItem[];
  total: number;
  onBack: () => void;
  /** Called once every item in the cart has been ordered. */
  onPlaced: () => void;
};

const submitClass =
  "inline-flex h-11 w-full items-center justify-center rounded-full bg-tomato text-sm font-semibold text-white outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60";

export function CheckoutForm({ items, total, onBack, onPlaced }: Props) {
  const { data: session, isPending } = authClient.useSession();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Items the server refused, by menu item id, so the customer can see why.
  const [failures, setFailures] = useState<Record<string, string>>({});

  const user = session?.user;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFailures({});

    // One order per item: the API has no multi-item order. They all share the
    // delivery details entered here.
    const results = await Promise.all(
      items.map(async (item) => ({
        item,
        result: await placeOrder({
          itemId: item.id,
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          ...(message.trim() ? { message: message.trim() } : {}),
        }),
      }))
    );

    const failed: Record<string, string> = {};
    let placed = 0;
    for (const { item, result } of results) {
      if (result.ok) {
        placed += 1;
        removeFromCart(item.id);
      } else {
        failed[item.id] = result.message;
      }
    }
    setSubmitting(false);

    if (placed > 0) {
      toast.add({
        type: "success",
        title: placed === 1 ? "Order placed" : `${placed} orders placed`,
        description: "Waiting for the vendor to accept.",
      });
    }
    if (Object.keys(failed).length === 0) {
      onPlaced();
      return;
    }
    setFailures(failed);
    toast.add({
      type: "error",
      title: "Some items could not be ordered",
      description: "See the details below.",
    });
  }

  if (isPending) {
    return <p className="p-6 text-sm text-ink/65">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-ink/65">Please sign in to place your order.</p>
        <Link href="/sign-in" className={`${submitClass} max-w-48`}>
          Sign in
        </Link>
        <BackButton onBack={onBack} />
      </div>
    );
  }

  if (user.role !== "customer") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-ink/65">Only customer accounts can place orders.</p>
        <BackButton onBack={onBack} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <BackButton onBack={onBack} />

        {Object.keys(failures).length > 0 && (
          <ul role="alert" className="space-y-1.5 rounded-xl border border-tomato/30 bg-tomato/10 p-3 text-sm">
            {items
              .filter((item) => failures[item.id])
              .map((item) => (
                <li key={item.id}>
                  <span className="font-medium">{item.name}:</span> {failures[item.id]}
                </li>
              ))}
          </ul>
        )}

        <p className="text-sm text-ink/65">
          Each item is placed as its own order, all with these delivery details.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="delivery-date">Delivery date</Label>
          <Input
            id="delivery-date"
            type="date"
            required
            min={todayUtc()}
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
            className="h-10 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="delivery-address">Delivery address</Label>
          <Textarea
            id="delivery-address"
            required
            maxLength={ADDRESS_MAX}
            placeholder="House, road, area, city"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="order-message">Message for the vendor (optional)</Label>
          <Textarea
            id="order-message"
            maxLength={MESSAGE_MAX}
            placeholder="Extra cheese, no onions..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-crust p-4">
        <div className="flex items-center justify-between font-medium">
          <span>Total</span>
          <span className="font-display text-lg font-bold">{formatMenuPrice(total)}</span>
        </div>
        <button type="submit" disabled={submitting} className={submitClass}>
          {submitting ? "Placing order..." : items.length === 1 ? "Place order" : `Place ${items.length} orders`}
        </button>
      </div>
    </form>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-ink/65 outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-tomato"
    >
      <ArrowLeftIcon aria-hidden="true" className="size-4" />
      Back to cart
    </button>
  );
}
