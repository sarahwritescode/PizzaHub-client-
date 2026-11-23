import Image from "next/image";
import Link from "next/link";
import { MapPin, PizzaIcon } from "lucide-react";
import { VendorInfo } from "@/components/menu/vendor-info";
import {
  formatMenuPrice,
  getMenuItemHref,
  type MenuItem,
} from "@/lib/menu-api";

function firstImage(images: string[]): string | undefined {
  return images.find((src) => /^https?:\/\//i.test(src));
}

export function MenuCard({ item }: { item: MenuItem }) {
  const image = firstImage(item.images);

  return (
    <Link
      href={getMenuItemHref(item._id)}
      className="group flex h-full gap-4 rounded-3xl border border-crust bg-white p-3 outline-none transition-[transform,box-shadow] duration-300 hover:shadow-[0_24px_48px_-28px_rgb(28_23_19/0.4)] focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-cream motion-safe:hover:-translate-y-1 sm:gap-5 sm:p-4"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-crust sm:size-36">
        {image ? (
          <Image
            src={image}
            alt={item.itemName}
            fill
            // Image hosts are not known ahead of time, so skip the optimizer
            // instead of requiring every host in next.config.
            unoptimized
            sizes="(min-width: 640px) 9rem, 6rem"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center text-tomato/50"
          >
            <PizzaIcon className="size-10" strokeWidth={1.75} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-tight font-bold text-ink sm:text-xl">
            {item.itemName}
          </h3>
          <p className="shrink-0 font-display text-lg leading-tight font-extrabold text-tomato sm:text-xl">
            {formatMenuPrice(item.price)}
          </p>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/65 sm:line-clamp-3">
          {item.description}
        </p>

        {item.vendor && (
          <div className="mt-2 min-w-0">
            <VendorInfo vendor={item.vendor} />
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3 text-xs font-medium">
          <span className="rounded-full bg-tomato/10 px-2.5 py-1 text-tomato">
            {item.category}
          </span>
          {item.location && (
            <span className="inline-flex items-center gap-1 text-ink/60">
              <MapPin aria-hidden="true" className="size-3.5" />
              {item.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
