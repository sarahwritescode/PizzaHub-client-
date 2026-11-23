import Image from "next/image";
import Link from "next/link";
import { MapPin, PizzaIcon } from "lucide-react";
import { VendorInfo } from "@/components/menu/vendor-info";
import { formatMenuPrice, getMenuItemHref, type MenuItem } from "@/lib/menu-api";

const buttonBase =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** A real, admin-approved menu item on the home page. */
export function ProductCard({ item }: { item: MenuItem }) {
  const { _id, itemName, description, price, category, location, images, vendor } = item;
  const image = images.find((src) => /^https?:\/\//i.test(src));

  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-crust bg-white p-3 transition-[transform,box-shadow] duration-300 hover:shadow-[0_28px_50px_-28px_rgb(28_23_19/0.4)] motion-safe:hover:-translate-y-1.5 sm:p-4">
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-crust">
        {image ? (
          <Image
            src={image}
            alt={itemName}
            fill
            // Vendor image hosts are not known ahead of time (see MenuCard).
            unoptimized
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
          />
        ) : (
          <span aria-hidden="true" className="flex size-full items-center justify-center text-tomato/50">
            <PizzaIcon className="size-14" strokeWidth={1.75} />
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm">
          {category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pt-5 pb-1.5 sm:px-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight font-bold text-ink">{itemName}</h3>
          <p className="shrink-0 font-display text-xl leading-tight font-extrabold text-tomato">
            {formatMenuPrice(price)}
          </p>
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/65 text-pretty">{description}</p>
        {vendor && (
          <div className="mt-3 min-w-0">
            <VendorInfo vendor={vendor} />
          </div>
        )}
        {location && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink/60">
            <MapPin aria-hidden="true" className="size-3.5" />
            {location}
          </p>
        )}

        <div className="mt-auto pt-5">
          <Link
            href={getMenuItemHref(_id)}
            aria-label={`View details for ${itemName}`}
            className={`${buttonBase} w-full bg-tomato text-cream hover:bg-tomato-deep`}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
