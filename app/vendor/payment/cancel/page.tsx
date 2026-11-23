import type { Metadata } from "next";
import { PaymentCancelled } from "@/components/vendor/payment-result";

export const metadata: Metadata = { title: "Payment cancelled | PizzaHub vendor" };

export default function Page() {
  return <PaymentCancelled />;
}
