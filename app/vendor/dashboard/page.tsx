import type { Metadata } from "next";
import { VendorDashboard } from "@/components/vendor/dashboard";

export const metadata: Metadata = { title: "Vendor dashboard | PizzaHub" };

export default function Page() {
  return <VendorDashboard />;
}
