import type { Metadata } from "next";
import { AddMenuItemPage } from "@/components/vendor/menu-form";

export const metadata: Metadata = { title: "Add menu item | PizzaHub vendor" };

export default function Page() {
  return <AddMenuItemPage />;
}
