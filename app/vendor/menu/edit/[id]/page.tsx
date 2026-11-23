import type { Metadata } from "next";
import { Suspense } from "react";
import { EditMenuItemPage } from "@/components/vendor/menu-form";

export const metadata: Metadata = { title: "Edit menu item | PizzaHub vendor" };

// params is request data, so it is read inside Suspense (same as app/menu/[id]).
async function EditItem({ params }: { params: PageProps<"/vendor/menu/edit/[id]">["params"] }) {
  const { id } = await params;
  return <EditMenuItemPage id={id} />;
}

export default function Page(props: PageProps<"/vendor/menu/edit/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-ink/65">Loading item...</p>}>
      <EditItem params={props.params} />
    </Suspense>
  );
}
