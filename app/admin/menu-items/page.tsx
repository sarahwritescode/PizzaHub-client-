import type { Metadata } from "next";
import { MenuModeration } from "@/components/admin/menu-moderation";

export const metadata: Metadata = { title: "Menu moderation | PizzaHub admin" };

export default function Page() {
  return <MenuModeration />;
}
