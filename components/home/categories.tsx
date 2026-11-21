import { CategoryCard } from "@/components/home/category-card";
import { InView } from "@/components/home/in-view";
import { getCategories } from "@/lib/categories";

export async function Categories() {
  const categories = await getCategories();

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="relative overflow-hidden bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <InView className="mx-auto max-w-2xl text-center">
          <h2
            id="categories-heading"
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl"
          >
            Explore Our Categories
          </h2>
          <p className="mt-4 text-base text-ink/70 sm:text-lg">
            Find your perfect slice from our delicious collection.
          </p>
        </InView>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <li key={category.id}>
              <InView className="h-full" delay={(index % 3) * 0.08}>
                <CategoryCard category={category} />
              </InView>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
