import type { Metadata } from "next";
import Link from "next/link";
import { PizzaIcon } from "lucide-react";

export const metadata: Metadata = { title: "Page not found | PizzaHub" };

const primary =
  "inline-flex h-11 items-center justify-center rounded-full bg-tomato px-6 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page";
const secondary =
  "inline-flex h-11 items-center justify-center rounded-full border-2 border-ink/15 px-6 text-sm font-semibold text-ink outline-none transition-colors hover:border-tomato hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page";

// Shown for any URL that does not exist (rendered inside the site layout, so
// the navbar and footer stay).
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-page px-4 py-20">
      <div className="max-w-md text-center">
        <PizzaIcon aria-hidden="true" className="mx-auto size-12 text-tomato/60" strokeWidth={1.5} />
        <p className="mt-4 font-display text-sm font-bold tracking-widest text-tomato uppercase">Error 404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">This slice is missing</h1>
        <p className="mt-3 text-ink/70">
          The page you are looking for does not exist, or it has moved. Head back home or browse the menu.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={primary}>
            Back to home
          </Link>
          <Link href="/menu" className={secondary}>
            Browse menu
          </Link>
        </div>
      </div>
    </main>
  );
}
