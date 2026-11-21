import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import {
  formatPrice,
  getProductHref,
  type Product,
} from "@/lib/products";

const buttonBase =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function ProductCard({ product }: { product: Product }) {
  const { id, name, description, price, currency, tags, image } = product;

  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-crust bg-white p-3 transition-[transform,box-shadow] duration-300 hover:shadow-[0_28px_50px_-28px_rgb(28_23_19/0.4)] motion-safe:hover:-translate-y-1.5 sm:p-4">
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-crust">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
          style={{ objectPosition: image.position }}
        />
        {tags.length > 0 && (
          <ul className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pt-5 pb-1.5 sm:px-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight font-bold text-ink">
            {name}
          </h3>
          <p className="font-display text-xl leading-tight font-extrabold text-tomato">
            {formatPrice(price, currency)}
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink/65 text-pretty">
          {description}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-5">
          <Link
            href={getProductHref(id)}
            aria-label={`View details for ${name}`}
            className={`${buttonBase} bg-tomato text-cream hover:bg-tomato-deep`}
          >
            View Details
          </Link>
          <button
            type="button"
            disabled
            title="Cart is coming soon"
            className={`${buttonBase} border-2 border-ink/15 text-ink/45 disabled:cursor-not-allowed`}
          >
            <ShoppingBag aria-hidden="true" className="size-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
