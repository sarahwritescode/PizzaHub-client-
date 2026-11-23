import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, StoreIcon } from "lucide-react";
import { AddToCartButton } from "@/components/menu/add-to-cart-button";
import { ItemGallery } from "@/components/menu/item-gallery";
import { OrderDialog } from "@/components/menu/order-dialog";
import { PremiumBadge } from "@/components/menu/vendor-info";
import { buildMenuHref, fetchMenuItem, formatMenuPrice, vendorLabel } from "@/lib/menu-api";

const backLinkClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-tomato px-6 text-sm font-semibold text-cream outline-none transition-colors hover:bg-tomato-deep focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page";

export async function ItemDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchMenuItem(id);

  if (!result.ok) {
    if (result.status === 404 || result.status === 400) notFound();
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-crust bg-surface px-6 py-10 text-center">
        <h2 className="font-display text-xl font-bold text-ink">
          We couldn&apos;t load this pizza
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          {result.message} Please try again in a moment.
        </p>
        <Link href={`/menu/${encodeURIComponent(id)}`} className={`${backLinkClass} mt-6`}>
          Try again
        </Link>
      </div>
    );
  }

  const item = result.data;
  const images = item.images.filter((src) => /^https?:\/\//i.test(src));
  const added = new Date(item.createdAt);
  const addedLabel = Number.isNaN(added.getTime())
    ? null
    : added.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <ItemGallery images={images} name={item.itemName} />

      <div className="flex flex-col">
        <Link
          href={buildMenuHref({ category: item.category })}
          className="w-fit rounded-full bg-tomato/10 px-3 py-1 text-sm font-medium text-tomato outline-none transition-colors hover:bg-tomato/15 focus-visible:ring-2 focus-visible:ring-tomato"
        >
          {item.category}
        </Link>

        <h1 className="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
          {item.itemName}
        </h1>

        <p className="mt-4 font-display text-3xl font-extrabold text-tomato sm:text-4xl">
          {formatMenuPrice(item.price)}
        </p>

        <p className="mt-6 max-w-prose text-base leading-relaxed whitespace-pre-line text-ink/75 text-pretty">
          {item.description}
        </p>

        <dl className="mt-8 grid gap-4 border-t border-crust pt-6 text-sm sm:grid-cols-2">
          {item.vendor && (
            <div className="flex items-start gap-3">
              <StoreIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-tomato" />
              <div className="min-w-0">
                <dt className="text-ink/55">Sold by</dt>
                <dd className="flex flex-wrap items-center gap-2 font-medium text-ink">
                  {vendorLabel(item.vendor)}
                  {item.vendor.isPremium && <PremiumBadge />}
                </dd>
              </div>
            </div>
          )}
          {item.location && (
            <div className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-tomato" />
              <div>
                <dt className="text-ink/55">Available at</dt>
                <dd className="font-medium text-ink">{item.location}</dd>
              </div>
            </div>
          )}
          {addedLabel && (
            <div className="flex items-start gap-3">
              <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-tomato" />
              <div>
                <dt className="text-ink/55">Added on</dt>
                <dd className="font-medium text-ink">{addedLabel}</dd>
              </div>
            </div>
          )}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <OrderDialog
            item={{
              id: item._id,
              name: item.itemName,
              category: item.category,
              price: item.price,
              location: item.location,
              description: item.description,
              image: images[0],
            }}
          />
          <AddToCartButton id={item._id} name={item.itemName} price={item.price} />
          <Link
            href="/menu"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-crust bg-surface px-6 text-sm font-semibold text-ink outline-none transition-colors hover:border-tomato hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to menu
          </Link>
        </div>
      </div>
    </article>
  );
}
