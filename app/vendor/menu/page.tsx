import type { Metadata } from "next";
import { MenuManager } from "@/components/vendor/menu-manager";

export const metadata: Metadata = { title: "Menu | PizzaHub vendor" };

export default function Page() {
  return <MenuManager />;
}
