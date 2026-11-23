"use client";

import { useId, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  PizzaIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { formatMenuPrice } from "@/lib/menu-api";
import {
  ADDRESS_MAX,
  MESSAGE_MAX,
  orderErrorMessage,
  placeOrder,
  todayUtc,
  type CustomerOrder,
} from "@/lib/orders-api";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  category: string;
  price: number;
  location: string;
  description: string;
  image?: string;
};

type Step = "details" | "payment" | "done";

const primaryClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tomato px-6 text-sm font-semibold text-white outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:cursor-not-allowed disabled:opacity-60";
const triggerClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-tomato px-8 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/60";
const linkButtonClass =
  "inline-flex items-center justify-center rounded-full text-sm font-medium text-ink/65 outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-tomato";

/**
 * "Order now": details -> demo payment -> confirmation.
 *
 * The backend has no payment API for orders, so the payment step is a clearly
 * labelled demo (no card data is collected, nothing is charged). The real
 * order is created with POST /api/orders when the customer presses Pay, so
 * going back from the payment step never leaves a half-made order behind, and
 * any server refusal (duplicate order, unavailable item, ...) is shown on the
 * details step where it can be fixed.
 */
export function OrderDialog({ item }: { item: Item }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const canOrder = isPending || !user || user.role === "customer";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const ids = { date: useId(), address: useId(), message: useId(), error: useId() };

  function reset() {
    setStep("details");
    setDeliveryDate("");
    setDeliveryAddress("");
    setMessage("");
    setError(null);
    setOrder(null);
  }

  function handleOpenChange(next: boolean) {
    if (paying) return;
    setOpen(next);
    // A finished order starts fresh next time; an unfinished one keeps what was typed.
    if (!next && step === "done") reset();
    if (!next && step === "payment") setStep("details");
  }

  function handleDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deliveryDate || deliveryDate < todayUtc()) {
      setError("Choose a delivery date that is today or later.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setError("Enter a delivery address.");
      return;
    }
    setError(null);
    setStep("payment");
  }

  async function handlePay() {
    setPaying(true);
    const result = await placeOrder({
      itemId: item.id,
      deliveryDate,
      deliveryAddress: deliveryAddress.trim(),
      ...(message.trim() ? { message: message.trim() } : {}),
    });
    setPaying(false);

    if (!result.ok) {
      // Back to the form, where the date or address can be changed.
      setError(orderErrorMessage(result.code, result.message));
      setStep("details");
      return;
    }
    setOrder(result.data);
    setStep("done");
    toast.add({ type: "success", title: "Order placed", description: `${item.name} is waiting for the vendor.` });
  }

  const wide = step === "details";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disabled={!canOrder} className={triggerClass}>
        <PizzaIcon aria-hidden="true" className="size-4" />
        Order now
      </DialogTrigger>
      {!canOrder && (
        <p className="basis-full text-xs text-ink/60">Only customer accounts can place orders.</p>
      )}

      <DialogContent
        className={cn(
          "max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto bg-page p-5 text-ink sm:p-7",
          wide ? "sm:max-w-3xl" : "sm:max-w-md"
        )}
      >
        {!user && !isPending ? (
          <SignInPrompt />
        ) : step === "details" ? (
          <>
            <DialogTitle className="font-display text-2xl font-bold">Your next favorite</DialogTitle>
            <DialogDescription className="sr-only">
              Choose a delivery date and address for {item.name}.
            </DialogDescription>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-7">
              <div className="relative hidden aspect-[4/5] overflow-hidden rounded-2xl border border-crust bg-crust md:block">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill unoptimized sizes="320px" className="object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-full items-center justify-center text-tomato/40">
                    <PizzaIcon className="size-16" strokeWidth={1.5} />
                  </span>
                )}
              </div>

              <form onSubmit={handleDetails} noValidate className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-tomato-deep uppercase">{item.category}</p>
                  <h2 className="mt-1 font-display text-2xl leading-tight font-bold">{item.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">{item.description}</p>
                  {item.location && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/60">
                      <MapPinIcon aria-hidden="true" className="size-3.5 text-tomato" /> {item.location}
                    </p>
                  )}
                </div>

                <p className="flex items-baseline gap-2 border-t border-crust pt-4">
                  <span className="font-display text-2xl font-extrabold">{formatMenuPrice(item.price)}</span>
                  <span className="text-xs text-ink/55">made fresh to order</span>
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor={ids.date}>Delivery date</Label>
                  <Input
                    id={ids.date}
                    type="date"
                    required
                    min={todayUtc()}
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    aria-describedby={error ? ids.error : undefined}
                    className="h-10 bg-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={ids.address}>Delivery address</Label>
                  <Input
                    id={ids.address}
                    required
                    maxLength={ADDRESS_MAX}
                    placeholder="Street, apartment, city"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    aria-describedby={error ? ids.error : undefined}
                    className="h-10 bg-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={ids.message}>
                    Special instructions <span className="font-normal text-ink/55">(optional)</span>
                  </Label>
                  <Textarea
                    id={ids.message}
                    maxLength={MESSAGE_MAX}
                    placeholder="Extra crispy, please..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="bg-surface"
                  />
                </div>

                {error && (
                  <p
                    id={ids.error}
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-tomato/30 bg-tomato/10 px-3 py-2 text-sm text-tomato-deep"
                  >
                    <TriangleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </p>
                )}

                <button type="submit" className={primaryClass}>
                  Continue to payment · {formatMenuPrice(item.price)}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </button>
                <p className="text-center text-xs text-ink/55">
                  Payment is simulated for this demo. No charge will be made.
                </p>
              </form>
            </div>
          </>
        ) : step === "payment" ? (
          <>
            <DialogTitle className="font-display text-2xl font-bold">Secure demo checkout</DialogTitle>
            <DialogDescription className="sr-only">Review your order and pay with the demo card.</DialogDescription>

            <DemoNotice />

            <div className="flex items-center gap-3 border-y border-crust py-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-crust">
                {item.image ? (
                  <Image src={item.image} alt="" fill unoptimized sizes="56px" className="object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-full items-center justify-center text-tomato/50">
                    <PizzaIcon className="size-6" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="truncate text-xs text-ink/60">
                  {item.location ? `${item.location} · ` : ""}Delivery {formatDate(deliveryDate)}
                </p>
              </div>
              <p className="font-display text-lg font-bold">{formatMenuPrice(item.price)}</p>
            </div>

            <div
              aria-label="Demo card ending 4242"
              className="relative flex aspect-[1.7] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a3a2e] to-[#2a1710] p-5 text-white shadow-lg"
            >
              <p className="text-[10px] tracking-[0.2em] text-white/60 uppercase">Demo card</p>
              <p className="font-mono text-xl tracking-widest sm:text-2xl">•••• •••• •••• 4242</p>
              <div className="flex items-end justify-between text-xs text-white/70">
                <span className="font-semibold tracking-wider">VISA</span>
                <span>12/30</span>
              </div>
            </div>

            <p className="text-xs text-ink/55">
              This checkout is for demonstration only. No payment is processed and no card details are collected.
            </p>

            <button type="button" onClick={handlePay} disabled={paying} className={primaryClass}>
              {paying ? "Placing your order..." : `Pay ${formatMenuPrice(item.price)}`}
              {!paying && <ArrowRightIcon aria-hidden="true" className="size-4" />}
            </button>
            <button type="button" onClick={() => setStep("details")} disabled={paying} className={linkButtonClass}>
              Back to order details
            </button>
          </>
        ) : (
          <>
            <DialogTitle className="font-display text-2xl font-bold">Payment complete</DialogTitle>
            <DialogDescription className="sr-only">Your order has been sent to the vendor.</DialogDescription>

            <DemoNotice />

            <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
              <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckIcon aria-hidden="true" className="size-8" />
              </span>
              <h2 className="font-display text-2xl font-bold">You&apos;re all set!</h2>
              <p className="max-w-xs text-sm leading-relaxed text-ink/65">
                Your demo payment went through and your order for {item.name} was sent to the vendor. It is pending
                until they accept it.
              </p>
            </div>

            {order ? (
              <Link href={`/customer/orders/${order._id}`} className={primaryClass}>
                View this order
              </Link>
            ) : null}
            <Link href="/customer/orders" className={linkButtonClass}>
              Go to my orders
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DemoNotice() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-crust bg-surface px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <ShieldCheckIcon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Demo payment</p>
        <p className="text-xs text-ink/60">No real card or money is used</p>
      </div>
      <span className="rounded-full bg-tomato/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-tomato-deep uppercase">
        Test mode
      </span>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <DialogTitle className="font-display text-2xl font-bold">Sign in to order</DialogTitle>
      <DialogDescription className="text-sm text-ink/65">
        You need a customer account to place an order.
      </DialogDescription>
      <Link href="/sign-in" className={primaryClass}>
        Sign in
      </Link>
    </div>
  );
}
