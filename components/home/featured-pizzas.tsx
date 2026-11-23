import Link from "next/link";
import { InView } from "@/components/home/in-view";
import { ProductCard } from "@/components/home/product-card";
import { fetchMenuItems } from "@/lib/menu-api";

const FEATURED_COUNT = 6;

// The newest approved items from the backend: an item shows up here as soon as
// an admin approves it (and leaves when it is deactivated or deleted).
export async function FeaturedPizzas() {
  const result = await fetchMenuItems({ sort: "newest", page: 1 }, FEATURED_COUNT);
  const items = result.ok ? result.data.items : [];

  return (
    <section
      id="featured-pizzas"
      aria-labelledby="featured-heading"
      className="relative overflow-hidden bg-cream"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <InView className="mx-auto max-w-2xl text-center">
          <h2
            id="featured-heading"
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl"
          >
            Fresh on the Menu
          </h2>
          <p className="mt-4 text-base text-ink/70 text-pretty sm:text-lg">
            The newest pizzas from our local pizzerias, made fresh with the finest ingredients.
          </p>
        </InView>

        {items.length > 0 ? (
          <>
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {items.map((item, index) => (
                <li key={item._id}>
                  <InView className="h-full" delay={(index % 3) * 0.08}>
                    <ProductCard item={item} />
                  </InView>
                </li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <Link
                href="/menu"
                className="inline-flex h-11 items-center justify-center rounded-full border-2 border-ink/15 px-6 text-sm font-semibold text-ink outline-none transition-colors hover:border-tomato hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2"
              >
                See the full menu
              </Link>
            </div>
          </>
        ) : (
          <p className="mx-auto mt-10 max-w-md rounded-3xl border border-crust bg-white px-6 py-10 text-center text-sm leading-relaxed text-ink/65">
            {result.ok
              ? "New pizzas will show up here as soon as they are approved."
              : "We couldn't load the menu right now. Please try again in a moment."}
          </p>
        )}
      </div>
    </section>
  );
}
