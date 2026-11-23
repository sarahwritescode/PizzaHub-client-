import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PizzaIcon } from "lucide-react";
import { buildMenuHref } from "@/lib/menu-api";

export type HomeCategory = {
  name: string;
  count: number;
  /** Photo of the newest item in this category, when it has one. */
  image?: string;
};

export function CategoryCard({ category }: { category: HomeCategory }) {
  const { name, count, image } = category;

  return (
    <Link
      href={buildMenuHref({ category: name })}
      className="group flex h-full flex-col items-center rounded-[1.75rem] border border-crust bg-page p-4 text-center outline-none transition-[transform,box-shadow,background-color] duration-300 hover:bg-surface hover:shadow-[0_24px_48px_-24px_rgb(28_23_19/0.35)] focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-safe:hover:-translate-y-1.5 sm:rounded-[2rem] sm:p-6"
    >
      <div className="relative aspect-square w-full max-w-44">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-tomato/30 transition-transform duration-500 ease-out motion-safe:group-hover:rotate-45 motion-safe:group-hover:scale-[1.03]"
        />
        <div className="absolute inset-2 overflow-hidden rounded-full bg-crust shadow-[0_12px_24px_-12px_rgb(28_23_19/0.45)]">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              // Vendor image hosts are not known ahead of time (see MenuCard).
              unoptimized
              sizes="(min-width: 1024px) 11rem, (min-width: 640px) 9rem, 40vw"
              className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
            />
          ) : (
            <span aria-hidden="true" className="flex size-full items-center justify-center text-tomato/50">
              <PizzaIcon className="size-1/3" strokeWidth={1.75} />
            </span>
          )}
        </div>
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-tomato text-cream ring-4 ring-page transition-colors duration-300 group-hover:bg-tomato-deep group-hover:ring-surface"
        >
          <ArrowUpRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg leading-tight font-bold text-ink sm:text-xl">{name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
        {count === 0 ? "Coming soon" : `${count} ${count === 1 ? "item" : "items"}`}
      </p>
    </Link>
  );
}
