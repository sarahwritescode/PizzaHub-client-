import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetails } from "@/components/customer/order-details";

export const metadata: Metadata = { title: "Order details | PizzaHub" };

// params is request data, so it is read inside Suspense (same as app/menu/[id]).
async function Order({ params }: { params: PageProps<"/customer/orders/[id]">["params"] }) {
  const { id } = await params;
  return <OrderDetails id={id} />;
}

export default function Page(props: PageProps<"/customer/orders/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-ink/65">Loading order...</p>}>
      <Order params={props.params} />
    </Suspense>
  );
}
