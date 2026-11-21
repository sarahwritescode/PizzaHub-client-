import { InView } from "@/components/home/in-view";
import { ProductCard } from "@/components/home/product-card";
import { getFeaturedProducts } from "@/lib/products";

export async function FeaturedPizzas() {
  const products = await getFeaturedProducts();

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
            Our Most Popular Pizzas
          </h2>
          <p className="mt-4 text-base text-ink/70 text-pretty sm:text-lg">
            Discover the pizzas everyone loves, made fresh with the finest
            ingredients.
          </p>
        </InView>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {products.map((product, index) => (
            <li key={product.id}>
              <InView className="h-full" delay={(index % 3) * 0.08}>
                <ProductCard product={product} />
              </InView>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
