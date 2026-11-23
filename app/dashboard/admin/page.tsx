import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard";

export const metadata: Metadata = { title: "Admin overview | PizzaHub" };

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
