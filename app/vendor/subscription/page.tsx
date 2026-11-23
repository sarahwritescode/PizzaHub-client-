import type { Metadata } from "next";
import { SubscriptionView } from "@/components/vendor/subscription-view";

export const metadata: Metadata = { title: "Subscription | PizzaHub vendor" };

export default function Page() {
  return <SubscriptionView />;
}
