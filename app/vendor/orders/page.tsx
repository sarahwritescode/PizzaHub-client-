import type { Metadata } from "next";
import { OrdersManager } from "@/components/vendor/orders-manager";

export const metadata: Metadata = { title: "Orders | PizzaHub vendor" };

export default function Page() {
  return <OrdersManager />;
}
