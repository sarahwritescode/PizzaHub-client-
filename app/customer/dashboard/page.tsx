import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/customer/dashboard";

export const metadata: Metadata = { title: "My dashboard | PizzaHub" };

export default function Page() {
  return <CustomerDashboard />;
}
