import type { Metadata } from "next";
import { OrdersList } from "@/components/customer/orders-list";

export const metadata: Metadata = { title: "My orders | PizzaHub" };

export default function Page() {
  return <OrdersList />;
}
