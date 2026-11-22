import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { ItemDetails } from "@/components/menu/item-details";

export const metadata: Metadata = {
  title: "Pizza details | PizzaHub",
  description: "See the full details of a pizza on the PizzaHub menu.",
};

function DetailsSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-2 lg:gap-14" aria-hidden="true">
      <div className="aspect-square rounded-[2rem] bg-crust" />
      <div className="space-y-4">
        <div className="h-7 w-24 rounded-full bg-crust" />
        <div className="h-12 w-3/4 rounded-2xl bg-crust" />
        <div className="h-10 w-32 rounded-2xl bg-crust" />
        <div className="h-4 w-full rounded bg-crust" />
        <div className="h-4 w-5/6 rounded bg-crust" />
        <div className="h-4 w-2/3 rounded bg-crust" />
      </div>
    </div>
  );
}

// proxy.ts keeps signed-out visitors off this route (they go to /sign-in and
// come back here afterwards).
export default function MenuItemPage(props: { params: Promise<{ id: string }> }) {
  return (
    <main className="flex-1 bg-cream">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-ink/65 outline-none transition-colors hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Menu
        </Link>

        {/* params is request data, so it is read inside Suspense. */}
        <Suspense fallback={<DetailsSkeleton />}>
          <ItemDetails params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}
