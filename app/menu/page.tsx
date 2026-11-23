import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuResults } from "@/components/menu/menu-results";
import { MenuSkeleton } from "@/components/menu/menu-skeleton";

export const metadata: Metadata = {
  title: "Menu | PizzaHub",
  description: "Browse every pizza on the PizzaHub menu and filter by category.",
};

export default function MenuPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <main className="flex-1 bg-page">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight text-ink sm:text-5xl">
            Our Menu
          </h1>
          <span
            aria-hidden="true"
            className="mx-auto mt-4 block h-1 w-24 rounded-full bg-tomato"
          />
          <p className="mt-5 text-base text-ink/70 text-pretty sm:text-lg">
            Browse everything on the menu and find your next favourite.
          </p>
        </header>

        {/* searchParams is request data, so it is read inside Suspense. */}
        <Suspense fallback={<MenuSkeleton />}>
          <MenuResults searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
