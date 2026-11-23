import type { Metadata } from "next";
import { PaymentSuccess } from "@/components/vendor/payment-result";

export const metadata: Metadata = { title: "Payment successful | PizzaHub vendor" };

export default function Page() {
  return <PaymentSuccess />;
}
