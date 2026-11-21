import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategoryHref, type PizzaCategory } from "@/lib/categories";

export function CategoryCard({ category }: { category: PizzaCategory }) {
  const { name, description, slug, image } = category;

  return (
    <Link
      href={getCategoryHref(slug)}
      className="group flex h-full flex-col items-center rounded-[1.75rem] border border-crust bg-cream p-4 text-center outline-none transition-[transform,box-shadow,background-color] duration-300 hover:bg-white hover:shadow-[0_24px_48px_-24px_rgb(28_23_19/0.35)] focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:hover:-translate-y-1.5 sm:rounded-[2rem] sm:p-6"
    >
      <div className="relative aspect-square w-full max-w-44">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-tomato/30 transition-transform duration-500 ease-out motion-safe:group-hover:rotate-45 motion-safe:group-hover:scale-[1.03]"
        />
        <div className="absolute inset-2 overflow-hidden rounded-full bg-crust shadow-[0_12px_24px_-12px_rgb(28_23_19/0.45)]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 11rem, (min-width: 640px) 9rem, 40vw"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
            style={{ objectPosition: image.position }}
          />
        </div>
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full bg-tomato text-cream ring-4 ring-cream transition-colors duration-300 group-hover:bg-tomato-deep group-hover:ring-white"
        >
          <ArrowUpRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg leading-tight font-bold text-ink sm:text-xl">
        {name}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/65 text-pretty">
        {description}
      </p>
    </Link>
  );
}
