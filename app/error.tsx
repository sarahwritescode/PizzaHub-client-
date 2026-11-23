"use client";

import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";

// Catches an unexpected error in any page below the root layout (the navbar and
// footer stay). Expected failures (a failed API call, a 404 item) are handled
// where they happen; this is the safety net.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-page px-4 py-20">
      <div role="alert" className="max-w-md text-center">
        <TriangleAlertIcon aria-hidden="true" className="mx-auto size-12 text-tomato/70" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">Something went wrong</h1>
        <p className="mt-3 text-ink/70">
          We hit an unexpected problem loading this page. Please try again. If it keeps happening, come back in a
          moment.
        </p>
        {error.digest && <p className="mt-2 text-xs text-ink/50">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-tomato px-6 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border-2 border-ink/15 px-6 text-sm font-semibold text-ink outline-none transition-colors hover:border-tomato hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
