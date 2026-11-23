import type { Metadata } from "next";
import { EditMenuItemPage } from "@/components/vendor/menu-form";

export const metadata: Metadata = { title: "Edit menu item | PizzaHub vendor" };

export default async function Page(props: PageProps<"/vendor/menu/edit/[id]">) {
  const { id } = await props.params;
  return <EditMenuItemPage id={id} />;
}
