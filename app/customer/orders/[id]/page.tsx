import type { Metadata } from "next";
import { OrderDetails } from "@/components/customer/order-details";

export const metadata: Metadata = { title: "Order details | PizzaHub" };

export default async function Page(props: PageProps<"/customer/orders/[id]">) {
  const { id } = await props.params;
  return <OrderDetails id={id} />;
}
