import { Categories } from "@/components/home/categories";
import { FeaturedPizzas } from "@/components/home/featured-pizzas";
import { Hero } from "@/components/home/hero";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Categories />
      <FeaturedPizzas />
    </main>
  );
}
