import { Categories } from "@/components/home/categories";
import { Hero } from "@/components/home/hero";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Categories />
    </main>
  );
}
