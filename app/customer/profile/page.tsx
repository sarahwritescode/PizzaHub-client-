import type { Metadata } from "next";
import { CustomerProfileView } from "@/components/customer/profile-view";

export const metadata: Metadata = { title: "My profile | PizzaHub" };

export default function Page() {
  return <CustomerProfileView />;
}
