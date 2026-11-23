"use client";

import "./globals.css";

// Last-resort page: used only when the root layout itself fails. It replaces
// the whole document, so it brings its own <html>, <body> and styles.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-cream px-4 text-ink">
        <title>Something went wrong | PizzaHub</title>
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Something went wrong</h1>
          <p className="mt-3 text-ink/70">PizzaHub hit an unexpected problem. Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-tomato px-6 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
