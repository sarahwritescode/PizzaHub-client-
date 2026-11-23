import Link from "next/link";

export default function MenuItemNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-page px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
          We can&apos;t find that pizza
        </h1>
        <p className="mt-3 text-ink/70">
          It may have been removed, or the link is incorrect. Browse the menu to find something
          else.
        </p>
        <Link
          href="/menu"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-tomato px-6 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page"
        >
          Back to menu
        </Link>
      </div>
    </main>
  );
}
